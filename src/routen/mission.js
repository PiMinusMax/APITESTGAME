import { route } from '../router.js';
import { antworte, leseJsonObjekt } from '../kontext.js';
import { ApiFehler, hex, waehle, zufall } from '../hilfen.js';
import { KUNDEN, LAGER, produkt } from '../daten.js';
import { brauchtToken } from './sicherheit.js';

// Nur Artikel, von denen sicher genug auf Lager ist.
const AUFTRAGS_ARTIKEL = Object.entries(LAGER)
  .filter(([, l]) => l.bestand >= 5)
  .map(([nummer]) => nummer);

function neuerAuftrag() {
  const k = waehle(KUNDEN);
  const artikelnummer = waehle(AUFTRAGS_ARTIKEL);
  return {
    auftragsnummer: `AUF-${zufall(1000, 9999)}`,
    kunde: { id: k.id, name: k.name },
    artikelnummer,
    menge: zufall(2, 5),
    lagerGeprueft: false,
    abgeschlossen: null,
  };
}

function auftragAnsicht(a) {
  return {
    auftragsnummer: a.auftragsnummer,
    status: a.abgeschlossen ? 'abgeschlossen' : 'offen',
    kunde: a.kunde,
    artikelnummer: a.artikelnummer,
    bezeichnung: produkt(a.artikelnummer).name,
    menge: a.menge,
    anweisungen: [
      `1. Prüfe mit dem SOAP-Lagerdienst (POST /soap/lager, Operation "LagerbestandAbfragen"), ob mindestens ${a.menge} Stück von ${a.artikelnummer} auf Lager sind.`,
      '2. Wenn genug da ist: Lege mit POST /api/lieferungen eine Lieferung an.',
      '   Body (JSON): auftragsnummer, kunde_id, artikelnummer, menge – Token im Authorization-Header nicht vergessen!',
    ],
  };
}

function auftrag(ctx) {
  brauchtToken(ctx);
  ctx.spieler.auftrag ??= neuerAuftrag();
  ctx.spieler.erfolg('auftrag_erhalten');
  return antworte(ctx, 200, auftragAnsicht(ctx.spieler.auftrag));
}

const typName = (w) => (Array.isArray(w) ? 'Liste' : w === null ? 'null' : { string: 'Text', number: 'Zahl', boolean: 'Wahrheitswert' }[typeof w] ?? typeof w);

async function lieferung(ctx) {
  brauchtToken(ctx);
  const a = ctx.spieler.auftrag;
  if (!a) {
    throw new ApiFehler(409, {
      fehler: 'Kein Auftrag vorhanden',
      nachricht: 'Du hast noch keinen Auftrag. Hole ihn zuerst mit GET /api/auftrag.',
    });
  }
  const d = await leseJsonObjekt(ctx);
  const erwartet = { auftragsnummer: a.auftragsnummer, kunde_id: a.kunde.id, artikelnummer: a.artikelnummer, menge: a.menge };
  const details = [];
  for (const [feld, soll] of Object.entries(erwartet)) {
    const ist = d[feld];
    if (ist === undefined) details.push({ feld, problem: 'fehlt' });
    else if (typeof ist !== typeof soll)
      details.push({
        feld,
        problem: `hat den falschen Typ: ${typName(ist)} statt ${typName(soll)}${
          typeof soll === 'number' ? ' (Zahlen ohne Anführungszeichen schreiben)' : ''
        }`,
      });
    else if (ist !== soll) details.push({ feld, problem: `passt nicht zum Auftrag (erwartet: ${JSON.stringify(soll)})` });
  }
  if (details.length) {
    throw new ApiFehler(422, {
      fehler: 'Lieferdaten passen nicht',
      nachricht: 'Vergleiche deinen Body genau mit dem Auftrag (GET /api/auftrag).',
      details,
    });
  }
  if (!a.lagerGeprueft) {
    throw new ApiFehler(409, {
      fehler: 'Lagerbestand nicht geprüft',
      nachricht: `Moment! Laut Anweisung musst du zuerst per SOAP prüfen, ob ${a.artikelnummer} auf Lager ist.`,
    });
  }
  if (a.abgeschlossen) {
    throw new ApiFehler(409, {
      fehler: 'Schon erledigt',
      nachricht: `Für ${a.auftragsnummer} gibt es bereits den Lieferschein ${a.abgeschlossen}. Doppelt liefern wäre teuer!`,
    });
  }
  a.abgeschlossen = `LS-${hex(3).toUpperCase()}`;
  ctx.spieler.erfolg('auftrag_abgeschlossen');
  return antworte(
    ctx,
    201,
    {
      nachricht: '🎉 Lieferung angelegt! Der Auftrag ist erledigt – du hast deine erste Integration durchgezogen.',
      lieferscheinnummer: a.abgeschlossen,
      status: 'versandbereit',
      auftragsnummer: a.auftragsnummer,
      kunde: a.kunde.name,
      artikel: `${a.menge} × ${produkt(a.artikelnummer).name}`,
    },
    { Location: `/api/lieferungen/${a.abgeschlossen}` },
  );
}

function lieferungLesen(ctx) {
  const a = ctx.spieler.auftrag;
  if (!a?.abgeschlossen || a.abgeschlossen !== ctx.params.nummer) {
    throw new ApiFehler(404, { fehler: 'Lieferschein nicht gefunden', nachricht: `"${ctx.params.nummer}" kenne ich nicht.` });
  }
  return antworte(ctx, 200, { lieferscheinnummer: a.abgeschlossen, status: 'versandbereit', auftrag: auftragAnsicht(a) });
}

export default [
  route('GET', '/api/auftrag', auftrag),
  route('POST', '/api/lieferungen', lieferung),
  route('GET', '/api/lieferungen/:nummer', lieferungLesen),
];
