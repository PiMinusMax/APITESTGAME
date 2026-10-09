import { route } from '../router.js';
import { antworte, leseJsonObjekt } from '../kontext.js';
import { ApiFehler, escXml, normalisiere, zufall } from '../hilfen.js';
import { STAEDTE, STADT_ALIASE } from '../daten.js';

const UEBERSICHT = [
  ['GET', '/api/hallo', 'Begrüßung – deine erste Anfrage'],
  ['GET', '/api/wetter?stadt=Berlin', 'Übungs-Wetterdaten (Query-Parameter: stadt, einheit)'],
  ['GET', '/api/notizen', 'Deine Notizen (CRUD: GET, POST, PUT, PATCH, DELETE)'],
  ['GET', '/api/tresor', 'Braucht einen API-Key im Header X-API-Key'],
  ['POST', '/api/login', 'Anmelden und Token holen'],
  ['GET', '/api/profil', 'Braucht Authorization: Bearer <token>'],
  ['GET', '/api/roboter', 'Zustand von Roboter Bit'],
  ['POST', '/api/roboter/bewegen', 'Roboter bewegen'],
  ['GET', '/api/kunden', 'Kunden (Filter, Sortierung, Seiten)'],
  ['GET', '/api/produkte', 'Produkte'],
  ['POST', '/soap/lager', 'SOAP-Lagerdienst (Vertrag: /soap/lager?wsdl)'],
  ['POST', '/graphql', 'GraphQL-Schnittstelle'],
];

function uebersicht(ctx) {
  return antworte(ctx, 200, {
    name: 'Mission Schnittstelle – Übungs-API',
    beschreibung: 'Eine echte HTTP-API zum Ausprobieren. Alle Daten sind ausgedacht.',
    dokumentation: '/#/handbuch',
    deine_spieler_id: ctx.spieler.id,
    endpunkte: UEBERSICHT.map(([methode, pfad, beschreibung]) => ({ methode, pfad, beschreibung })),
  });
}

function willXml(accept = '') {
  const a = accept.toLowerCase();
  // Browser schicken beim Öffnen einer Seite auch "application/xml" mit – die meinen wir hier nicht.
  if (a.includes('text/html')) return false;
  return (a.includes('application/xml') || a.includes('text/xml')) && !a.includes('application/json');
}

function hallo(ctx) {
  if (ctx.selbstGeschrieben) ctx.spieler.erfolg('konsole_fetch');
  const daten = {
    nachricht: 'Hallo! 👋 Du hast gerade erfolgreich eine Anfrage an die API geschickt.',
    zeitpunkt: new Date().toISOString(),
    methode: ctx.methode,
    pfad: '/api/hallo',
    tipp: 'Schau dir diese Anfrage im Netzwerk-Tab der Entwicklerwerkzeuge an.',
  };
  if (willXml(ctx.req.headers.accept)) {
    ctx.spieler.erfolg('accept_xml');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<antwort>
  <nachricht>Hallo! Du hast dieselben Daten diesmal als XML bestellt.</nachricht>
  <zeitpunkt>${daten.zeitpunkt}</zeitpunkt>
  <methode>${escXml(daten.methode)}</methode>
  <pfad>${daten.pfad}</pfad>
  <tipp>Der Header "Accept" sagt dem Server, welches Format du dir wünschst.</tipp>
</antwort>
`;
    return antworte(ctx, 200, xml, { 'Content-Type': 'application/xml; charset=utf-8', Vary: 'Accept' });
  }
  return antworte(ctx, 200, daten, { Vary: 'Accept' });
}

function umleitung(ctx) {
  return antworte(
    ctx,
    301,
    { hinweis: 'Diese Adresse ist dauerhaft umgezogen. Die neue Adresse steht im Header "Location".' },
    { Location: '/api/hallo' },
  );
}

// Einfache, aber stabile Pseudo-Zufallszahl: gleiche Stadt + gleicher Tag = gleiches Wetter.
function saat(text) {
  let h = 2166136261;
  for (const z of text) h = Math.imul(h ^ z.codePointAt(0), 16777619) >>> 0;
  return h;
}

const WETTERLAGEN = ['sonnig ☀️', 'leicht bewölkt 🌤️', 'bewölkt ☁️', 'regnerisch 🌧️', 'windig 🌬️', 'neblig 🌫️', 'gewittrig ⛈️'];

function wetter(ctx) {
  const roh = ctx.query.get('stadt');
  if (!roh || !roh.trim()) {
    throw new ApiFehler(400, {
      fehler: 'Parameter fehlt',
      nachricht: 'Bitte gib eine Stadt an, zum Beispiel: /api/wetter?stadt=Berlin',
      fehlender_parameter: 'stadt',
    });
  }
  const norm = normalisiere(roh);
  const schluessel = STADT_ALIASE[norm] ?? norm.replace(/[\s-]/g, '');
  const stadt = STAEDTE[schluessel];
  if (!stadt) {
    throw new ApiFehler(404, {
      fehler: 'Stadt nicht gefunden',
      nachricht: `Für "${roh}" habe ich leider keine Wetterdaten.`,
      verfuegbare_staedte: Object.values(STAEDTE).map((s) => s.name),
    });
  }
  const einheit = normalisiere(ctx.query.get('einheit') || 'celsius');
  if (!['celsius', 'fahrenheit'].includes(einheit)) {
    throw new ApiFehler(400, {
      fehler: 'Unbekannte Einheit',
      nachricht: `"${ctx.query.get('einheit')}" kenne ich nicht.`,
      erlaubt: ['celsius', 'fahrenheit'],
    });
  }

  ctx.spieler.erfolg(`wetter_${schluessel}`);
  const datum = new Date().toISOString().slice(0, 10);
  const s = saat(`${schluessel}|${datum}`);
  const celsius = stadt.basis + (s % 11) - 5;
  return antworte(ctx, 200, {
    stadt: stadt.name,
    datum,
    temperatur: einheit === 'celsius' ? celsius : Math.round(celsius * 1.8 + 32),
    einheit: einheit === 'celsius' ? '°C' : '°F',
    wetterlage: WETTERLAGEN[(s >> 4) % WETTERLAGEN.length],
    wind_kmh: 5 + ((s >> 8) % 35),
    luftfeuchtigkeit_prozent: 40 + ((s >> 12) % 50),
    hinweis: 'Übungsdaten – das ist kein echter Wetterbericht.',
  });
}

function geheimnis(ctx) {
  return antworte(
    ctx,
    200,
    {
      nachricht: 'Psst! 🕵️ Gut gemacht – du hast die versteckte Antwort gefunden.',
      geheimcode: ctx.spieler.geheimcode,
      naechster_schritt: 'Schau dir bei dieser Anfrage jetzt auch die Antwort-Header an …',
    },
    { 'X-Geheimer-Hinweis': ctx.spieler.hinweiscode },
  );
}

async function paket(ctx) {
  const d = await leseJsonObjekt(ctx);
  const pflicht = ['empfaenger', 'strasse', 'plz', 'ort'];
  const fehlend = pflicht.filter((f) => d[f] === undefined || d[f] === null || String(d[f]).trim() === '');
  if (fehlend.length) {
    throw new ApiFehler(422, {
      fehler: 'Validierung fehlgeschlagen',
      nachricht: `Das Paket kann nicht verschickt werden. Es fehlt: ${fehlend.join(', ')}`,
      details: fehlend.map((feld) => ({ feld, problem: 'Pflichtfeld fehlt oder ist leer' })),
    });
  }
  if (!/^\d{5}$/.test(String(d.plz).trim())) {
    throw new ApiFehler(422, {
      fehler: 'Validierung fehlgeschlagen',
      nachricht: 'Die Postleitzahl muss aus genau 5 Ziffern bestehen.',
      details: [{ feld: 'plz', problem: 'ungültiges Format' }],
    });
  }
  ctx.spieler.erfolg('paket_verschickt');
  return antworte(ctx, 201, {
    nachricht: 'Paket angenommen! 📦',
    sendungsnummer: `PK${zufall(100000000, 999999999)}`,
    empfaenger: String(d.empfaenger).slice(0, 80),
    ort: `${String(d.plz).trim()} ${String(d.ort).slice(0, 60)}`,
  });
}

function typVon(wert) {
  if (wert === null) return 'null';
  if (Array.isArray(wert)) return 'Liste';
  return { string: 'Text', number: 'Zahl', boolean: 'Wahrheitswert', object: 'Objekt' }[typeof wert] ?? typeof wert;
}

async function steckbrief(ctx) {
  const d = await leseJsonObjekt(ctx);
  const details = [];
  const fehlt = (feld) => d[feld] === undefined;

  if (fehlt('name')) details.push({ feld: 'name', problem: 'fehlt' });
  else if (typeof d.name !== 'string' || !d.name.trim())
    details.push({ feld: 'name', problem: `muss ein nicht-leerer Text sein, z. B. "Alex" (du hast: ${typVon(d.name)})` });
  else if (d.name.length > 60) details.push({ feld: 'name', problem: 'ist zu lang (höchstens 60 Zeichen)' });

  if (fehlt('lieblingszahl')) details.push({ feld: 'lieblingszahl', problem: 'fehlt' });
  else if (typeof d.lieblingszahl === 'string')
    details.push({
      feld: 'lieblingszahl',
      problem: `ist ein Text ("${d.lieblingszahl}"). Zahlen schreibt man in JSON ohne Anführungszeichen, z. B. 7`,
    });
  else if (typeof d.lieblingszahl !== 'number')
    details.push({ feld: 'lieblingszahl', problem: `muss eine Zahl sein (du hast: ${typVon(d.lieblingszahl)})` });

  if (fehlt('mag_kaffee')) details.push({ feld: 'mag_kaffee', problem: 'fehlt' });
  else if (typeof d.mag_kaffee !== 'boolean')
    details.push({
      feld: 'mag_kaffee',
      problem: `muss true oder false sein – klein geschrieben und ohne Anführungszeichen (du hast: ${typVon(d.mag_kaffee)})`,
    });

  if (fehlt('hobbys')) details.push({ feld: 'hobbys', problem: 'fehlt' });
  else if (!Array.isArray(d.hobbys))
    details.push({ feld: 'hobbys', problem: `muss eine Liste sein, z. B. ["Lesen", "Kochen"] (du hast: ${typVon(d.hobbys)})` });
  else if (d.hobbys.length < 2) details.push({ feld: 'hobbys', problem: 'braucht mindestens 2 Einträge' });
  else if (!d.hobbys.every((h) => typeof h === 'string' && h.trim()))
    details.push({ feld: 'hobbys', problem: 'alle Einträge müssen Texte in Anführungszeichen sein' });

  if (details.length) {
    throw new ApiFehler(400, {
      fehler: 'Steckbrief unvollständig',
      nachricht: `Fast! ${details.length} ${details.length === 1 ? 'Feld passt' : 'Felder passen'} noch nicht.`,
      details,
    });
  }

  ctx.spieler.erfolg('steckbrief');
  return antworte(ctx, 201, {
    nachricht: `Danke, ${d.name.trim()}! Dein Steckbrief ist gültiges JSON und alle Felder haben den richtigen Typ. 🎉`,
    erhalten: { name: d.name.trim(), lieblingszahl: d.lieblingszahl, mag_kaffee: d.mag_kaffee, hobbys: d.hobbys },
    typen: { name: 'Text', lieblingszahl: 'Zahl', mag_kaffee: 'Wahrheitswert', hobbys: 'Liste' },
    hinweis: 'Der Steckbrief wird nicht gespeichert.',
  });
}

function teekanne(ctx) {
  return antworte(ctx, 418, {
    fehler: 'Ich bin eine Teekanne',
    nachricht: 'Ich kann keinen Kaffee kochen – ich bin eine Teekanne. 🫖',
    hintergrund:
      'Statuscode 418 stammt aus einem Aprilscherz von 1998 (RFC 2324, "Hyper Text Coffee Pot Control Protocol"). Viele Systeme kennen ihn bis heute.',
  });
}

function kaputt(ctx) {
  return antworte(ctx, 500, {
    fehler: 'Interner Serverfehler',
    nachricht: 'Autsch! 🔥 Hier ist absichtlich etwas kaputt. So sieht ein Serverfehler aus.',
    was_tun:
      'Bei 5xx-Fehlern liegt das Problem beim Server, nicht bei dir. Später erneut versuchen oder den Betreiber informieren – mit Zeitpunkt und X-Anfrage-ID.',
    anfrage_id: ctx.anfrageId,
  });
}

function wartung(ctx) {
  return antworte(
    ctx,
    503,
    {
      fehler: 'Dienst nicht verfügbar',
      nachricht: 'Wir sind gerade in der Wartung. 🧰 Bitte versuche es später noch einmal.',
      tipp: 'Der Header "Retry-After" verrät, nach wie vielen Sekunden sich ein neuer Versuch lohnt.',
    },
    { 'Retry-After': '120' },
  );
}

const KEKS_LIMIT = 3;
const KEKS_FENSTER_MS = 10 * 1000;

function kekse(ctx) {
  const jetzt = Date.now();
  const s = ctx.spieler;
  s.keksZeiten = s.keksZeiten.filter((t) => jetzt - t < KEKS_FENSTER_MS);
  if (s.keksZeiten.length >= KEKS_LIMIT) {
    const warte = Math.max(1, Math.ceil((KEKS_FENSTER_MS - (jetzt - s.keksZeiten[0])) / 1000));
    throw new ApiFehler(
      429,
      {
        fehler: 'Zu viele Anfragen',
        nachricht: `Nicht so schnell! 🍪 Maximal ${KEKS_LIMIT} Kekse in 10 Sekunden. Warte ${warte} Sekunden.`,
      },
      { 'Retry-After': String(warte), 'X-RateLimit-Limit': String(KEKS_LIMIT), 'X-RateLimit-Remaining': '0' },
    );
  }
  s.keksZeiten.push(jetzt);
  return antworte(
    ctx,
    200,
    {
      keks: '🍪',
      nachricht: 'Hier, ein Keks für dich!',
      kekse_in_den_letzten_10_sekunden: s.keksZeiten.length,
      limit: `${KEKS_LIMIT} pro 10 Sekunden`,
    },
    { 'X-RateLimit-Limit': String(KEKS_LIMIT), 'X-RateLimit-Remaining': String(KEKS_LIMIT - s.keksZeiten.length) },
  );
}

export default [
  route('GET', '/api', uebersicht),
  route('GET', '/api/hallo', hallo),
  route('GET', '/api/v1/hallo', umleitung),
  route('GET', '/api/wetter', wetter),
  route('GET', '/api/geheimnis', geheimnis),
  route('POST', '/api/paket', paket),
  route('POST', '/api/steckbrief', steckbrief),
  route('GET', '/api/teekanne', teekanne),
  route('POST', '/api/teekanne', teekanne),
  route('GET', '/api/kaputt', kaputt),
  route('GET', '/api/wartung', wartung),
  route('GET', '/api/kekse', kekse),
];
