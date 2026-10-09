import { route } from '../router.js';
import { antworte, leseJsonObjekt } from '../kontext.js';
import { ApiFehler } from '../hilfen.js';

const MAX_NOTIZEN = 50;

function findeNotiz(ctx) {
  const id = Number(ctx.params.id);
  const notiz = Number.isInteger(id) ? ctx.spieler.notizen.find((n) => n.id === id) : null;
  if (!notiz) {
    throw new ApiFehler(404, {
      fehler: 'Notiz nicht gefunden',
      nachricht: `Eine Notiz mit der ID "${ctx.params.id}" gibt es (nicht mehr).`,
      tipp: 'Mit GET /api/notizen siehst du alle vorhandenen Notizen und ihre IDs.',
    });
  }
  return notiz;
}

function pruefeFeld(name, wert, { pflicht, max }) {
  if (wert === undefined) {
    if (pflicht) return { feld: name, problem: 'fehlt' };
    return null;
  }
  if (typeof wert !== 'string') return { feld: name, problem: 'muss ein Text in "Anführungszeichen" sein' };
  if (name === 'titel' && !wert.trim()) return { feld: name, problem: 'darf nicht leer sein' };
  if (wert.length > max) return { feld: name, problem: `ist zu lang (höchstens ${max} Zeichen)` };
  return null;
}

function validiere(d, { titelPflicht, textPflicht }) {
  const details = [
    pruefeFeld('titel', d.titel, { pflicht: titelPflicht, max: 100 }),
    pruefeFeld('text', d.text, { pflicht: textPflicht, max: 2000 }),
  ].filter(Boolean);
  if (details.length) {
    throw new ApiFehler(400, {
      fehler: 'Ungültige Daten',
      nachricht: details.map((x) => `"${x.feld}" ${x.problem}`).join(', '),
      details,
    });
  }
}

function meldeAenderung(ctx) {
  ctx.spieler.sende('notizen', { notizen: ctx.spieler.notizen });
}

function liste(ctx) {
  ctx.spieler.erfolg('notizen_gelesen');
  return antworte(ctx, 200, ctx.spieler.notizen);
}

function einzeln(ctx) {
  return antworte(ctx, 200, findeNotiz(ctx));
}

async function anlegen(ctx) {
  const d = await leseJsonObjekt(ctx);
  validiere(d, { titelPflicht: true, textPflicht: false });
  if (ctx.spieler.notizen.length >= MAX_NOTIZEN) {
    throw new ApiFehler(400, {
      fehler: 'Zu viele Notizen',
      nachricht: `Mehr als ${MAX_NOTIZEN} Notizen gehen nicht. Lösche erst ein paar mit DELETE.`,
    });
  }
  const jetzt = new Date().toISOString();
  const notiz = {
    id: ctx.spieler.naechsteNotizId++,
    titel: d.titel.trim(),
    text: d.text ?? '',
    erstellt_am: jetzt,
    geaendert_am: jetzt,
  };
  ctx.spieler.notizen.push(notiz);
  ctx.spieler.erfolg('notiz_erstellt');
  if (ctx.selbstGeschrieben) ctx.spieler.erfolg('konsole_post');
  meldeAenderung(ctx);
  return antworte(ctx, 201, notiz, { Location: `/api/notizen/${notiz.id}` });
}

async function ersetzen(ctx) {
  const notiz = findeNotiz(ctx);
  const d = await leseJsonObjekt(ctx);
  try {
    validiere(d, { titelPflicht: true, textPflicht: true });
  } catch (e) {
    e.daten.tipp = 'PUT ersetzt die ganze Notiz – deshalb müssen "titel" UND "text" mitgeschickt werden. Für einzelne Felder nimm PATCH.';
    throw e;
  }
  notiz.titel = d.titel.trim();
  notiz.text = d.text;
  notiz.geaendert_am = new Date().toISOString();
  ctx.spieler.erfolg('notiz_geaendert');
  meldeAenderung(ctx);
  return antworte(ctx, 200, notiz);
}

async function teilweiseAendern(ctx) {
  const notiz = findeNotiz(ctx);
  const d = await leseJsonObjekt(ctx);
  if (d.titel === undefined && d.text === undefined) {
    throw new ApiFehler(400, {
      fehler: 'Nichts zu ändern',
      nachricht: 'Schicke mindestens eines der Felder "titel" oder "text".',
      beispiel: { titel: 'Neuer Titel' },
    });
  }
  validiere(d, { titelPflicht: false, textPflicht: false });
  if (d.titel !== undefined) notiz.titel = d.titel.trim();
  if (d.text !== undefined) notiz.text = d.text;
  notiz.geaendert_am = new Date().toISOString();
  ctx.spieler.erfolg('notiz_geaendert');
  meldeAenderung(ctx);
  return antworte(ctx, 200, notiz);
}

function loeschen(ctx) {
  const notiz = findeNotiz(ctx);
  ctx.spieler.notizen = ctx.spieler.notizen.filter((n) => n !== notiz);
  ctx.spieler.erfolg('notiz_geloescht');
  meldeAenderung(ctx);
  return antworte(ctx, 204);
}

export default [
  route('GET', '/api/notizen', liste),
  route('POST', '/api/notizen', anlegen),
  route('GET', '/api/notizen/:id', einzeln),
  route('PUT', '/api/notizen/:id', ersetzen),
  route('PATCH', '/api/notizen/:id', teilweiseAendern),
  route('DELETE', '/api/notizen/:id', loeschen),
];
