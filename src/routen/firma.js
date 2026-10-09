import { route } from '../router.js';
import { antworte } from '../kontext.js';
import { ApiFehler, normalisiere } from '../hilfen.js';
import { BESTELLUNGEN, KUNDEN, LAGER, PRODUKTE, bestellungenVon, kunde, produkt } from '../daten.js';

function ganzzahl(ctx, name, standard, min, max) {
  const roh = ctx.query.get(name);
  if (roh === null || roh === '') return standard;
  const n = Number(roh);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new ApiFehler(400, {
      fehler: 'Ungültiger Parameter',
      nachricht: `"${name}" muss eine ganze Zahl zwischen ${min} und ${max} sein.`,
    });
  }
  return n;
}

function mitLinks(k) {
  return { ...k, links: { selbst: `/api/kunden/${k.id}`, bestellungen: `/api/kunden/${k.id}/bestellungen` } };
}

function kundenListe(ctx) {
  let treffer = [...KUNDEN];
  const stadt = ctx.query.get('stadt');
  const name = ctx.query.get('name');
  if (stadt) treffer = treffer.filter((k) => normalisiere(k.stadt) === normalisiere(stadt));
  if (name) treffer = treffer.filter((k) => normalisiere(k.name).includes(normalisiere(name)));

  const sortierung = ctx.query.get('sortierung');
  if (sortierung) {
    const absteigend = sortierung.startsWith('-');
    const feld = sortierung.replace(/^-/, '');
    if (!['id', 'name', 'stadt', 'kunde_seit'].includes(feld)) {
      throw new ApiFehler(400, {
        fehler: 'Unbekannte Sortierung',
        nachricht: `Nach "${feld}" kann ich nicht sortieren.`,
        erlaubt: ['id', 'name', 'stadt', 'kunde_seit', '-name (minus = absteigend)'],
      });
    }
    treffer.sort((a, b) => String(a[feld]).localeCompare(String(b[feld]), 'de', { numeric: true }) * (absteigend ? -1 : 1));
  }

  const limit = ganzzahl(ctx, 'limit', 5, 1, 50);
  const seiten = Math.max(1, Math.ceil(treffer.length / limit));
  const seite = ganzzahl(ctx, 'seite', 1, 1, 1000);
  const daten = treffer.slice((seite - 1) * limit, seite * limit).map(mitLinks);

  const link = (s) => {
    const p = new URLSearchParams(ctx.query);
    p.set('seite', s);
    p.set('limit', limit);
    return `/api/kunden?${p}`;
  };
  return antworte(ctx, 200, {
    daten,
    meta: { gesamt: treffer.length, seite, limit, seiten },
    links: {
      selbst: link(seite),
      naechste: seite < seiten ? link(seite + 1) : null,
      vorherige: seite > 1 ? link(seite - 1) : null,
    },
  });
}

function findeKunde(ctx) {
  const k = kunde(ctx.params.id);
  if (!k) {
    throw new ApiFehler(404, {
      fehler: 'Kunde nicht gefunden',
      nachricht: `Einen Kunden mit der ID "${ctx.params.id}" gibt es nicht.`,
      tipp: `Gültige IDs: 1 bis ${KUNDEN.length}`,
    });
  }
  return k;
}

function kundeEinzeln(ctx) {
  return antworte(ctx, 200, mitLinks(findeKunde(ctx)));
}

function kundeBestellungen(ctx) {
  const k = findeKunde(ctx);
  const liste = bestellungenVon(k.id);
  return antworte(ctx, 200, { kunde_id: k.id, kunde: k.name, anzahl: liste.length, bestellungen: liste });
}

function produktListe(ctx) {
  let liste = PRODUKTE;
  const kategorie = ctx.query.get('kategorie');
  if (kategorie) liste = liste.filter((p) => normalisiere(p.kategorie) === normalisiere(kategorie));
  return antworte(ctx, 200, liste);
}

function produktEinzeln(ctx) {
  const p = produkt(ctx.params.nummer);
  if (!p) {
    throw new ApiFehler(404, {
      fehler: 'Produkt nicht gefunden',
      nachricht: `Ein Produkt "${ctx.params.nummer}" gibt es nicht.`,
      tipp: 'Gültige Artikelnummern: A-1001 bis A-1008',
    });
  }
  return antworte(ctx, 200, {
    ...p,
    hinweis: `Den Lagerbestand verrät dir nur der SOAP-Lagerdienst (/soap/lager).`,
    lager_verfuegbar: LAGER[p.artikelnummer].bestand > 0,
  });
}

function bestellungEinzeln(ctx) {
  const b = BESTELLUNGEN.find((x) => x.nummer === String(ctx.params.nummer).toUpperCase());
  if (!b) {
    throw new ApiFehler(404, { fehler: 'Bestellung nicht gefunden', nachricht: `Die Bestellung "${ctx.params.nummer}" gibt es nicht.` });
  }
  return antworte(ctx, 200, b);
}

export default [
  route('GET', '/api/kunden', kundenListe),
  route('GET', '/api/kunden/:id', kundeEinzeln),
  route('GET', '/api/kunden/:id/bestellungen', kundeBestellungen),
  route('GET', '/api/produkte', produktListe),
  route('GET', '/api/produkte/:nummer', produktEinzeln),
  route('GET', '/api/bestellungen/:nummer', bestellungEinzeln),
];
