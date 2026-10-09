import { hex, waehle, zufall } from './hilfen.js';
import { neuerRoboter } from './roboter.js';

const WOERTER = [
  'ANANAS', 'KOMET', 'PIXEL', 'LOTSE', 'ORBIT', 'FALKE', 'NEBEL', 'QUARZ', 'TURBO', 'ZEBRA',
  'KAKTUS', 'MAGNET', 'RAKETE', 'POLARIS', 'DELFIN', 'VULKAN', 'GLETSCHER', 'KOMPASS', 'LIBELLE', 'MONSUN',
];

const MAX_SPIELER = Number(process.env.MAX_SPIELER) || 20000;
const INAKTIV_MS = 48 * 60 * 60 * 1000;
export const ID_MUSTER = /^[a-f0-9]{12}$/;

// Map-Reihenfolge = zuletzt benutzt (älteste zuerst) → einfache LRU-Verdrängung.
const spielerListe = new Map();
const alleVerbindungen = new Set();

export class Spieler {
  constructor(id) {
    const jetzt = new Date().toISOString();
    const wort1 = waehle(WOERTER);
    let wort2 = waehle(WOERTER);
    while (wort2 === wort1) wort2 = waehle(WOERTER);

    this.id = id;
    this.zuletzt = Date.now();
    this.geheimcode = `${wort1}-${zufall(10, 99)}`;
    this.hinweiscode = `${wort2}-${zufall(100, 999)}`;
    this.apiKey = `key_${hex(8)}`;
    this.notizen = [
      {
        id: 1,
        titel: 'Willkommen!',
        text: 'Das ist deine erste Notiz. Sie gehört nur dir – probiere ruhig alles aus.',
        erstellt_am: jetzt,
        geaendert_am: jetzt,
      },
    ];
    this.naechsteNotizId = 2;
    this.roboter = neuerRoboter(1);
    this.hoechstesLevel = 1;
    this.statuscodes = new Set();
    this.erfolge = new Set();
    this.keksZeiten = [];
    this.anfrageZeiten = [];
    this.auftrag = null;
    this.verbindungen = new Set();
  }

  /** Markiert einen Erfolg (z. B. "notiz_erstellt") und meldet ihn live an die Spielseite. */
  erfolg(name) {
    if (this.erfolge.has(name)) return false;
    this.erfolge.add(name);
    this.sende('erfolg', { name });
    return true;
  }

  statuscode(code) {
    if (this.statuscodes.has(code)) return;
    this.statuscodes.add(code);
    this.sende('statuscode', { code });
  }

  sende(typ, daten) {
    const nachricht = `event: ${typ}\ndata: ${JSON.stringify(daten)}\n\n`;
    for (const res of this.verbindungen) res.write(nachricht);
  }

  verbinde(res) {
    this.verbindungen.add(res);
    alleVerbindungen.add(res);
  }

  trenne(res) {
    this.verbindungen.delete(res);
    alleVerbindungen.delete(res);
  }

  trenneAlle() {
    for (const res of this.verbindungen) {
      alleVerbindungen.delete(res);
      res.end();
    }
    this.verbindungen.clear();
  }
}

export function holeSpieler(id) {
  const s = spielerListe.get(id);
  if (!s) return null;
  spielerListe.delete(id);
  spielerListe.set(id, s);
  s.zuletzt = Date.now();
  return s;
}

export function erzeugeSpieler(id = hex(6)) {
  while (spielerListe.size >= MAX_SPIELER) {
    const [aeltesteId, aeltester] = spielerListe.entries().next().value;
    aeltester.trenneAlle();
    spielerListe.delete(aeltesteId);
  }
  const s = new Spieler(id);
  spielerListe.set(id, s);
  return s;
}

export function anzahlSpieler() {
  return spielerListe.size;
}

function aufraeumen() {
  const grenze = Date.now() - INAKTIV_MS;
  for (const [id, s] of spielerListe) {
    if (s.zuletzt >= grenze) break; // ab hier sind alle jünger
    if (s.verbindungen.size) continue;
    spielerListe.delete(id);
  }
}

setInterval(aufraeumen, 10 * 60 * 1000).unref();

// Kommentarzeile hält Live-Verbindungen (Server-Sent Events) durch Proxys hindurch offen.
setInterval(() => {
  for (const res of alleVerbindungen) res.write(': ping\n\n');
}, 25 * 1000).unref();
