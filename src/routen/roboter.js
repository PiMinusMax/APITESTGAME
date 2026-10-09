import { route } from '../router.js';
import { antworte, leseJsonObjekt } from '../kontext.js';
import { ApiFehler } from '../hilfen.js';
import { FARBEN, LEVELS, bewege, farbeAuslesen, neuerRoboter, richtungAuslesen, roboterAnsicht } from '../roboter.js';

function melde(ctx, befehl, meldung) {
  ctx.spieler.sende('roboter', { zustand: roboterAnsicht(ctx.spieler), befehl, meldung, quelle: ctx.quelle });
}

function zustand(ctx) {
  return antworte(ctx, 200, roboterAnsicht(ctx.spieler));
}

async function bewegen(ctx) {
  const d = await leseJsonObjekt(ctx);
  const richtung = richtungAuslesen(d.richtung);
  if (!richtung) {
    throw new ApiFehler(400, {
      fehler: 'Unbekannte Richtung',
      nachricht:
        d.richtung === undefined
          ? 'Im Body fehlt das Feld "richtung".'
          : `Die Richtung "${d.richtung}" kenne ich nicht.`,
      erlaubt: ['oben', 'unten', 'links', 'rechts'],
      beispiel: { richtung: 'rechts', schritte: 2 },
    });
  }
  const schritte = d.schritte === undefined ? 1 : d.schritte;
  if (!Number.isInteger(schritte) || schritte < 1 || schritte > 10) {
    throw new ApiFehler(400, {
      fehler: 'Ungültige Schrittzahl',
      nachricht: '"schritte" muss eine ganze Zahl zwischen 1 und 10 sein – ohne Anführungszeichen, z. B. 3',
    });
  }
  const r = ctx.spieler.roboter;
  if (r.geschafft) {
    const naechstes = Math.min(r.level + 1, LEVELS.length);
    throw new ApiFehler(409, {
      fehler: 'Level schon geschafft',
      nachricht: `${r.name} steht schon am Ziel von Level ${r.level}. 🎉 Starte ein Level mit POST /api/roboter/neustart`,
      beispiel_body: { level: naechstes },
    });
  }

  const ergebnis = bewege(r, richtung, schritte);
  ctx.spieler.erfolg('roboter_bewegt');
  if (ergebnis.amZiel) {
    ctx.spieler.erfolg(`roboter_ziel_${r.level}`);
    ctx.spieler.hoechstesLevel = Math.max(ctx.spieler.hoechstesLevel, Math.min(r.level + 1, LEVELS.length));
  }
  melde(ctx, `bewegen: ${richtung} × ${schritte}`, ergebnis.meldung);

  const antwort = { meldung: ergebnis.meldung, gelaufen: ergebnis.gelaufen, ...roboterAnsicht(ctx.spieler) };
  if (ergebnis.amZiel && r.level < LEVELS.length) {
    antwort.naechster_schritt = { methode: 'POST', pfad: '/api/roboter/neustart', body: { level: r.level + 1 } };
  }
  return antworte(ctx, 200, antwort);
}

async function aendern(ctx) {
  const d = await leseJsonObjekt(ctx);
  const r = ctx.spieler.roboter;
  if (d.farbe === undefined && d.name === undefined) {
    throw new ApiFehler(400, {
      fehler: 'Nichts zu ändern',
      nachricht: 'Schicke "farbe" und/oder "name".',
      beispiel: { farbe: 'lila' },
    });
  }
  const geaendert = [];
  if (d.farbe !== undefined) {
    const farbe = farbeAuslesen(d.farbe);
    if (!farbe) {
      throw new ApiFehler(400, {
        fehler: 'Unbekannte Farbe',
        nachricht: `Die Farbe "${d.farbe}" kenne ich nicht.`,
        erlaubt: Object.keys(FARBEN),
        oder: 'einen Hex-Farbcode wie "#ff8800"',
      });
    }
    r.farbe = farbe.hex;
    r.farbname = farbe.name;
    geaendert.push('farbe');
    ctx.spieler.erfolg('roboter_farbe');
  }
  if (d.name !== undefined) {
    if (typeof d.name !== 'string' || !d.name.trim() || d.name.trim().length > 20) {
      throw new ApiFehler(400, { fehler: 'Ungültiger Name', nachricht: '"name" muss ein Text mit 1 bis 20 Zeichen sein.' });
    }
    r.name = d.name.trim();
    geaendert.push('name');
    ctx.spieler.erfolg('roboter_name');
  }
  const meldung = `Geändert: ${geaendert.join(' und ')}.`;
  melde(ctx, `ändern: ${geaendert.join(', ')}`, meldung);
  return antworte(ctx, 200, { meldung, ...roboterAnsicht(ctx.spieler) });
}

async function sprechen(ctx) {
  const d = await leseJsonObjekt(ctx);
  if (typeof d.text !== 'string' || !d.text.trim()) {
    throw new ApiFehler(400, {
      fehler: 'Text fehlt',
      nachricht: 'Schicke im Body ein Feld "text", z. B. { "text": "Hallo Welt!" }',
    });
  }
  if (d.text.length > 80) {
    throw new ApiFehler(400, { fehler: 'Zu lang', nachricht: 'Höchstens 80 Zeichen, sonst passt es nicht in die Sprechblase.' });
  }
  const r = ctx.spieler.roboter;
  r.sagt = d.text.trim();
  r.sagt_um = new Date().toISOString();
  ctx.spieler.erfolg('roboter_spricht');
  melde(ctx, 'sprechen', `${r.name} sagt: „${r.sagt}“`);
  return antworte(ctx, 200, { meldung: `${r.name} hat gesprochen.`, ...roboterAnsicht(ctx.spieler) });
}

async function neustart(ctx) {
  const d = await leseJsonObjekt(ctx, { erforderlich: false });
  const alt = ctx.spieler.roboter;
  const level = d.level === undefined ? alt.level : d.level;
  if (!Number.isInteger(level) || level < 1 || level > LEVELS.length) {
    throw new ApiFehler(400, {
      fehler: 'Unbekanntes Level',
      nachricht: `"level" muss eine Zahl von 1 bis ${LEVELS.length} sein.`,
    });
  }
  if (level > ctx.spieler.hoechstesLevel) {
    throw new ApiFehler(403, {
      fehler: 'Level gesperrt',
      nachricht: `Level ${level} ist noch gesperrt. Schaffe zuerst Level ${ctx.spieler.hoechstesLevel}.`,
    });
  }
  ctx.spieler.roboter = neuerRoboter(level, alt);
  const meldung = `Level ${level} („${LEVELS[level - 1].titel}“) gestartet. Viel Erfolg!`;
  melde(ctx, `neustart: Level ${level}`, meldung);
  return antworte(ctx, 200, { meldung, ...roboterAnsicht(ctx.spieler) });
}

export default [
  route('GET', '/api/roboter', zustand),
  route('PATCH', '/api/roboter', aendern),
  route('POST', '/api/roboter/bewegen', bewegen),
  route('POST', '/api/roboter/sprechen', sprechen),
  route('POST', '/api/roboter/neustart', neustart),
];
