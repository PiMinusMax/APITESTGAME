// Spielstand: Fortschritt im Browser (localStorage) + Live-Zustand vom Server.
import { toast } from './ui.js';

const SCHLUESSEL = 'mission-schnittstelle:spielstand';

export const RAENGE = [
  { ab: 0, titel: 'Frisch gestartet', icon: '🌱' },
  { ab: 150, titel: 'Neugierig', icon: '🔍' },
  { ab: 400, titel: 'Auf Empfang', icon: '📡' },
  { ab: 750, titel: 'Anfragen-Profi', icon: '📨' },
  { ab: 1150, titel: 'Schnittstellen-Kenner', icon: '🧩' },
  { ab: 1600, titel: 'Integrations-Talent', icon: '🚀' },
  { ab: 2100, titel: 'API-Meisterschaft', icon: '🏆' },
];

function leer() {
  return {
    version: 1,
    name: '',
    xp: 0,
    aufgaben: {}, // id → { xp, zeit }
    schritte: {}, // kapitelId → höchster freigeschalteter Schritt (Index)
    alleFrei: false,
    konsoleHallo: false,
    statuscodes: [],
    erfolge: [],
    verlauf: [],
    gestartet: null,
  };
}

function laden() {
  try {
    const roh = localStorage.getItem(SCHLUESSEL);
    if (!roh) return leer();
    return { ...leer(), ...JSON.parse(roh) };
  } catch {
    return leer();
  }
}

const abonnenten = new Set();
let daten = laden();

export const server = {
  verbunden: false,
  spielerId: null,
  erfolge: new Set(daten.erfolge),
  statuscodes: new Set(daten.statuscodes),
  roboter: null,
  notizen: null,
  protokoll: [],
};

function speichern() {
  daten.erfolge = [...server.erfolge];
  daten.statuscodes = [...server.statuscodes];
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(daten));
  } catch {
    /* privater Modus o. Ä. – dann eben ohne Speichern */
  }
}

export function melde(typ, info = {}) {
  for (const fn of abonnenten) fn(typ, info);
}

export const store = {
  get daten() {
    return daten;
  },
  abonnieren(fn) {
    abonnenten.add(fn);
    return () => abonnenten.delete(fn);
  },

  setzeName(name) {
    daten.name = name.trim().slice(0, 40);
    daten.gestartet ??= new Date().toISOString();
    speichern();
    melde('name');
  },

  istErledigt: (id) => Boolean(daten.aufgaben[id]),

  /** Markiert eine Aufgabe als erledigt und vergibt XP. Gibt true zurück, wenn sie neu war. */
  erledige(id, xp = 0, titel = '') {
    if (daten.aufgaben[id]) return false;
    const rangVorher = store.rang();
    daten.aufgaben[id] = { xp, zeit: new Date().toISOString() };
    daten.xp += xp;
    daten.gestartet ??= new Date().toISOString();
    speichern();
    if (xp > 0) toast(`<strong>+${xp} XP</strong> ${titel ? `· ${titel}` : ''}`, 'erfolg');
    const rangNachher = store.rang();
    if (rangNachher.titel !== rangVorher.titel) {
      setTimeout(() => toast(`${rangNachher.icon} Neuer Rang: <strong>${rangNachher.titel}</strong>!`, 'rang', 6000), 600);
    }
    melde('aufgabe', { id });
    return true;
  },

  schritt: (kapitelId) => daten.schritte[kapitelId] ?? 0,
  setzeSchritt(kapitelId, index) {
    if ((daten.schritte[kapitelId] ?? 0) >= index) return;
    daten.schritte[kapitelId] = index;
    speichern();
    melde('schritt', { kapitelId });
  },

  kapitelFertig: (kapitelId) => store.istErledigt(`kapitel:${kapitelId}`),

  rang(xp = daten.xp) {
    return [...RAENGE].reverse().find((r) => xp >= r.ab);
  },
  naechsterRang(xp = daten.xp) {
    return RAENGE.find((r) => r.ab > xp) ?? null;
  },

  setzeAlleFrei(wert = true) {
    daten.alleFrei = wert;
    speichern();
    melde('freischaltung');
  },

  merkeKonsoleHallo() {
    if (daten.konsoleHallo) return false;
    daten.konsoleHallo = true;
    speichern();
    melde('konsole-hallo');
    return true;
  },

  merkeVerlauf(eintrag) {
    daten.verlauf = [eintrag, ...daten.verlauf].slice(0, 20);
    speichern();
  },

  zuruecksetzen() {
    daten = leer();
    server.erfolge = new Set();
    server.statuscodes = new Set();
    speichern();
    melde('reset');
  },

  // ---- Live-Zustand vom Server ----
  hatErfolg: (name) => server.erfolge.has(name),
  hatStatuscode: (code) => server.statuscodes.has(Number(code)),

  uebernehmeServer({ spieler_id, erfolge = [], statuscodes = [] }) {
    if (spieler_id) server.spielerId = spieler_id;
    const vorher = server.erfolge.size + server.statuscodes.size;
    erfolge.forEach((e) => server.erfolge.add(e));
    statuscodes.forEach((c) => server.statuscodes.add(c));
    if (server.erfolge.size + server.statuscodes.size !== vorher) speichern();
    melde('server');
  },
  neuerErfolg(name) {
    if (server.erfolge.has(name)) return;
    server.erfolge.add(name);
    speichern();
    melde('erfolg', { name });
  },
  neuerStatuscode(code) {
    if (server.statuscodes.has(code)) return;
    server.statuscodes.add(code);
    speichern();
    melde('statuscode', { code });
  },
};
