import { route } from '../router.js';
import { antworte, leseJsonObjekt, sseKopf } from '../kontext.js';
import { ApiFehler, normalisiere, zahlGleich } from '../hilfen.js';
import { LOESUNGEN } from '../daten.js';
import { roboterAnsicht } from '../roboter.js';

// Antworten, die nur der Server kennt (persönliche Codes) oder die aus den Daten berechnet werden.
const PRUEFUNGEN = {
  geheimcode: {
    pruefe: (s, a) => normalisiere(a) === normalisiere(s.geheimcode),
    falsch: 'Das ist nicht der Geheimcode. Er steht in der Antwort (Body) der Anfrage „geheimnis“.',
  },
  geheimhinweis: {
    pruefe: (s, a) => normalisiere(a) === normalisiere(s.hinweiscode),
    falsch: 'Nicht ganz. Der Hinweis steht in den Antwort-Headern, nicht im Body.',
  },
  fehlerfeld: {
    pruefe: (s, a) => ['plz', 'postleitzahl'].includes(normalisiere(a)),
    falsch: 'Das ist nicht das fehlende Feld. Lies die Fehlermeldung in der Antwort der Anfrage „paket“.',
  },
  spieler_id: {
    pruefe: (s, a) => normalisiere(a).replace(/^spieler_id\s*=\s*/, '').replace(/;$/, '') === s.id,
    falsch: 'Die ID stimmt nicht. Sie besteht aus 12 Zeichen (Ziffern 0–9 und Buchstaben a–f).',
  },
  bestellbetrag: {
    pruefe: (s, a) => zahlGleich(a, LOESUNGEN.bestellbetrag),
    falsch: 'Der Betrag stimmt nicht. Hast du die richtige Kundin (Erika!) und ihre NEUESTE Bestellung genommen?',
  },
  kunden_hamburg: {
    pruefe: (s, a) => zahlGleich(a, LOESUNGEN.kundenHamburg),
    falsch: 'Die Anzahl stimmt nicht. Tipp: Filtere mit ?stadt=Hamburg und schau in "meta".',
  },
  soap_bestand: {
    pruefe: (s, a) => zahlGleich(a, LOESUNGEN.bestandA1002),
    falsch: 'Das ist nicht der Bestand von A-1002. Steht in deiner Anfrage wirklich A-1002?',
  },
  graphql_bestellungen: {
    pruefe: (s, a) => zahlGleich(a, LOESUNGEN.bestellungenKunde3),
    falsch: 'Die Anzahl stimmt nicht. Frag nach kunde(id: 3) und zähle seine bestellungen.',
  },
};

function ereignisse(ctx) {
  ctx.beantwortet = true;
  const { req, res, spieler } = ctx;
  res.writeHead(200, sseKopf(ctx));
  res.write('retry: 3000\n\n');
  spieler.verbinde(res);
  res.write(
    `event: init\ndata: ${JSON.stringify({
      spieler_id: spieler.id,
      erfolge: [...spieler.erfolge],
      statuscodes: [...spieler.statuscodes],
      roboter: roboterAnsicht(spieler),
      notizen: spieler.notizen,
    })}\n\n`,
  );
  req.on('close', () => spieler.trenne(res));
}

function fortschritt(ctx) {
  return antworte(ctx, 200, {
    spieler_id: ctx.spieler.id,
    erfolge: [...ctx.spieler.erfolge],
    statuscodes: [...ctx.spieler.statuscodes],
  });
}

async function pruefen(ctx) {
  const d = await leseJsonObjekt(ctx);
  const pruefung = PRUEFUNGEN[d.aufgabe];
  if (!pruefung) {
    throw new ApiFehler(404, { fehler: 'Unbekannte Aufgabe', nachricht: `Eine Prüfung "${d.aufgabe}" gibt es nicht.` });
  }
  const richtig = pruefung.pruefe(ctx.spieler, d.antwort ?? '');
  return antworte(ctx, 200, {
    aufgabe: d.aufgabe,
    richtig,
    nachricht: richtig ? 'Richtig! 🎉' : pruefung.falsch,
  });
}

export default [
  route('GET', '/api/ereignisse', ereignisse),
  route('GET', '/api/fortschritt', fortschritt),
  route('POST', '/api/pruefen', pruefen),
];
