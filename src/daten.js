import { geld } from './hilfen.js';

/** Übungsdaten eines kleinen Online-Shops für Computerzubehör. Alles ausgedacht. */

export const PRODUKTE = [
  { artikelnummer: 'A-1001', name: 'USB-C-Kabel (1 m)', preis: 9.9, kategorie: 'Zubehör' },
  { artikelnummer: 'A-1002', name: 'Funkmaus', preis: 24.9, kategorie: 'Eingabegeräte' },
  { artikelnummer: 'A-1003', name: 'Mechanische Tastatur', preis: 89.0, kategorie: 'Eingabegeräte' },
  { artikelnummer: 'A-1004', name: '27-Zoll-Monitor', preis: 249.0, kategorie: 'Bildschirme' },
  { artikelnummer: 'A-1005', name: 'HD-Webcam', preis: 49.9, kategorie: 'Zubehör' },
  { artikelnummer: 'A-1006', name: 'Headset mit Mikrofon', preis: 59.9, kategorie: 'Audio' },
  { artikelnummer: 'A-1007', name: 'Laptop-Ständer', preis: 34.9, kategorie: 'Zubehör' },
  { artikelnummer: 'A-1008', name: 'Dockingstation', preis: 129.0, kategorie: 'Zubehör' },
];

export const LAGER = {
  'A-1001': { bestand: 240, lagerort: 'Regal 1-A' },
  'A-1002': { bestand: 57, lagerort: 'Regal 2-C' },
  'A-1003': { bestand: 12, lagerort: 'Regal 2-D' },
  'A-1004': { bestand: 3, lagerort: 'Halle B' },
  'A-1005': { bestand: 0, lagerort: 'Regal 3-A' },
  'A-1006': { bestand: 31, lagerort: 'Regal 4-B' },
  'A-1007': { bestand: 18, lagerort: 'Regal 1-F' },
  'A-1008': { bestand: 7, lagerort: 'Halle B' },
};

const mail = (vorname, nachname) =>
  `${vorname}.${nachname}`
    .toLowerCase()
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') + '@example.com';

export const KUNDEN = [
  ['Max', 'Mustermann', 'Berlin', '2021-02-14'],
  ['Aylin', 'Yılmaz', 'Hamburg', '2022-07-01'],
  ['Jonas', 'Becker', 'München', '2020-11-23'],
  ['Erika', 'Mustermann', 'Köln', '2019-05-08'],
  ['Sophie', 'Wagner', 'Hamburg', '2023-01-30'],
  ['Mehmet', 'Kaya', 'Frankfurt am Main', '2022-03-17'],
  ['Lena', 'Schmidt', 'Leipzig', '2024-09-02'],
  ['Tobias', 'Hoffmann', 'Hamburg', '2021-12-11'],
  ['Marie', 'Schulz', 'Stuttgart', '2023-06-21'],
  ['Lukas', 'Neumann', 'Dresden', '2025-02-03'],
  ['Fatima', 'Haddad', 'Berlin', '2024-04-15'],
  ['Paul', 'Richter', 'Hamburg', '2020-08-27'],
].map(([vorname, nachname, stadt, seit], i) => ({
  id: i + 1,
  name: `${vorname} ${nachname}`,
  email: mail(vorname, nachname),
  stadt,
  kunde_seit: seit,
}));

const BESTELL_ROH = [
  ['B-1001', 1, '2026-03-02', [['A-1002', 1], ['A-1001', 2]], 'geliefert'],
  ['B-1002', 4, '2026-03-15', [['A-1007', 1]], 'geliefert'],
  ['B-1003', 3, '2026-04-01', [['A-1004', 2]], 'geliefert'],
  ['B-1004', 2, '2026-04-11', [['A-1005', 1], ['A-1006', 1]], 'geliefert'],
  ['B-1005', 4, '2026-05-20', [['A-1001', 3]], 'geliefert'],
  ['B-1006', 3, '2026-06-03', [['A-1008', 1]], 'geliefert'],
  ['B-1007', 5, '2026-06-17', [['A-1002', 2]], 'geliefert'],
  ['B-1008', 7, '2026-07-08', [['A-1003', 1]], 'geliefert'],
  ['B-1009', 4, '2026-08-29', [['A-1003', 1], ['A-1006', 1]], 'geliefert'],
  ['B-1010', 3, '2026-09-12', [['A-1001', 1], ['A-1007', 1]], 'versendet'],
  ['B-1011', 11, '2026-09-20', [['A-1008', 1], ['A-1002', 1]], 'versendet'],
  ['B-1012', 8, '2026-09-30', [['A-1006', 2]], 'in Bearbeitung'],
];

export const BESTELLUNGEN = BESTELL_ROH.map(([nummer, kunde_id, datum, pos, status]) => {
  const positionen = pos.map(([artikelnummer, menge]) => {
    const p = PRODUKTE.find((x) => x.artikelnummer === artikelnummer);
    return { artikelnummer, bezeichnung: p.name, menge, einzelpreis: p.preis };
  });
  const gesamtbetrag = geld(positionen.reduce((summe, p) => summe + p.menge * p.einzelpreis, 0));
  return { nummer, kunde_id, datum, status, positionen, gesamtbetrag, waehrung: 'EUR' };
});

export const produkt = (nr) => PRODUKTE.find((p) => p.artikelnummer === String(nr).trim().toUpperCase());
export const kunde = (id) => KUNDEN.find((k) => k.id === Number(id));
export const bestellungenVon = (kundeId) =>
  BESTELLUNGEN.filter((b) => b.kunde_id === Number(kundeId)).sort((a, b) => a.datum.localeCompare(b.datum));

// Erwartete Antworten für die Rätsel werden aus den Daten berechnet, nicht hart codiert.
export const LOESUNGEN = {
  get bestellbetrag() {
    const erika = KUNDEN.find((k) => k.name === 'Erika Mustermann');
    return bestellungenVon(erika.id).at(-1).gesamtbetrag;
  },
  get kundenHamburg() {
    return KUNDEN.filter((k) => k.stadt === 'Hamburg').length;
  },
  get bestandA1002() {
    return LAGER['A-1002'].bestand;
  },
  get bestellungenKunde3() {
    return bestellungenVon(3).length;
  },
};

export const STAEDTE = {
  berlin: { name: 'Berlin', basis: 14 },
  hamburg: { name: 'Hamburg', basis: 12 },
  muenchen: { name: 'München', basis: 13 },
  koeln: { name: 'Köln', basis: 15 },
  frankfurt: { name: 'Frankfurt am Main', basis: 15 },
  stuttgart: { name: 'Stuttgart', basis: 14 },
  duesseldorf: { name: 'Düsseldorf', basis: 15 },
  leipzig: { name: 'Leipzig', basis: 13 },
  dresden: { name: 'Dresden', basis: 13 },
  hannover: { name: 'Hannover', basis: 13 },
  nuernberg: { name: 'Nürnberg', basis: 13 },
  bremen: { name: 'Bremen', basis: 12 },
  kiel: { name: 'Kiel', basis: 11 },
  rostock: { name: 'Rostock', basis: 11 },
  wien: { name: 'Wien', basis: 15 },
  zuerich: { name: 'Zürich', basis: 12 },
};

export const STADT_ALIASE = { 'frankfurt am main': 'frankfurt', 'frankfurt/main': 'frankfurt', munich: 'muenchen', cologne: 'koeln', vienna: 'wien' };
