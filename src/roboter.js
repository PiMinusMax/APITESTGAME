import { normalisiere } from './hilfen.js';

// S = Start, Z = Ziel, # = Mauer, . = frei.  x läuft nach rechts, y nach unten.
const LEVEL_KARTEN = [
  {
    titel: 'Geradeaus',
    karte: ['.......', '.......', 'S.....Z', '.......', '.......'],
  },
  {
    titel: 'Um die Ecken',
    karte: ['....#.Z', '....#..', '..#.#..', '..#....', 'S.#....'],
  },
  {
    titel: 'Das Labyrinth',
    karte: ['S.#...#.', '..#.#.#.', '#.#.#...', '....###.', '.###..#.', '...#.#.Z'],
  },
];

export const LEVELS = LEVEL_KARTEN.map((l, i) => {
  const hindernisse = [];
  let start;
  let ziel;
  l.karte.forEach((zeile, y) => {
    [...zeile].forEach((zeichen, x) => {
      if (zeichen === '#') hindernisse.push({ x, y });
      if (zeichen === 'S') start = { x, y };
      if (zeichen === 'Z') ziel = { x, y };
    });
  });
  return {
    nummer: i + 1,
    titel: l.titel,
    breite: l.karte[0].length,
    hoehe: l.karte.length,
    start,
    ziel,
    hindernisse,
  };
});

export const FARBEN = {
  rot: '#e5484d',
  orange: '#f76b15',
  gelb: '#f5c400',
  gruen: '#30a46c',
  blau: '#0090ff',
  lila: '#8e4ec6',
  pink: '#d6409f',
  tuerkis: '#12a594',
  braun: '#a07553',
  gold: '#d4a72c',
  grau: '#8b8d98',
  schwarz: '#222222',
  weiss: '#ffffff',
};

const RICHTUNGEN = {
  oben: { dx: 0, dy: -1 },
  unten: { dx: 0, dy: 1 },
  links: { dx: -1, dy: 0 },
  rechts: { dx: 1, dy: 0 },
};

const RICHTUNG_ALIASE = {
  oben: 'oben', hoch: 'oben', rauf: 'oben', norden: 'oben', up: 'oben',
  unten: 'unten', runter: 'unten', sueden: 'unten', down: 'unten',
  links: 'links', westen: 'links', left: 'links',
  rechts: 'rechts', osten: 'rechts', right: 'rechts',
};

export function richtungAuslesen(eingabe) {
  if (typeof eingabe !== 'string') return null;
  return RICHTUNG_ALIASE[normalisiere(eingabe)] ?? null;
}

export function farbeAuslesen(eingabe) {
  if (typeof eingabe !== 'string') return null;
  const t = eingabe.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t)) return { hex: t.toLowerCase(), name: t.toLowerCase() };
  const schluessel = normalisiere(t);
  if (FARBEN[schluessel]) return { hex: FARBEN[schluessel], name: t.toLowerCase() };
  return null;
}

export function neuerRoboter(levelNummer = 1, alt = null) {
  const level = LEVELS[levelNummer - 1];
  return {
    name: alt?.name ?? 'Bit',
    farbe: alt?.farbe ?? FARBEN.blau,
    farbname: alt?.farbname ?? 'blau',
    level: level.nummer,
    x: level.start.x,
    y: level.start.y,
    blick: 'rechts',
    sagt: '',
    sagt_um: null,
    schritte: 0,
    geschafft: false,
  };
}

function istHindernis(level, x, y) {
  return level.hindernisse.some((h) => h.x === x && h.y === y);
}

/** Bewegt den Roboter Feld für Feld, bis Mauer, Rand oder Ziel ihn stoppen. */
export function bewege(roboter, richtung, schritte) {
  const level = LEVELS[roboter.level - 1];
  const { dx, dy } = RICHTUNGEN[richtung];
  roboter.blick = richtung;
  let gelaufen = 0;
  let stopp = null;
  for (let i = 0; i < schritte; i++) {
    const nx = roboter.x + dx;
    const ny = roboter.y + dy;
    if (nx < 0 || ny < 0 || nx >= level.breite || ny >= level.hoehe) {
      stopp = 'rand';
      break;
    }
    if (istHindernis(level, nx, ny)) {
      stopp = 'mauer';
      break;
    }
    roboter.x = nx;
    roboter.y = ny;
    gelaufen++;
    roboter.schritte++;
    if (nx === level.ziel.x && ny === level.ziel.y) {
      roboter.geschafft = true;
      stopp = 'ziel';
      break;
    }
  }

  const feld = gelaufen === 1 ? 'Feld' : 'Felder';
  let meldung = `${roboter.name} ist ${gelaufen} ${feld} nach ${richtung} gelaufen.`;
  if (stopp === 'mauer') meldung += ' Dann kam eine Mauer – autsch! 🧱';
  if (stopp === 'rand') meldung += ' Dann war das Spielfeld zu Ende.';
  if (stopp === 'ziel') meldung = `⭐ Ziel erreicht! ${roboter.name} hat Level ${roboter.level} geschafft.`;
  return { gelaufen, stopp, meldung, amZiel: stopp === 'ziel' };
}

export function roboterAnsicht(spieler) {
  const r = spieler.roboter;
  const level = LEVELS[r.level - 1];
  return {
    name: r.name,
    farbe: r.farbe,
    position: { x: r.x, y: r.y },
    blickrichtung: r.blick,
    sagt: r.sagt,
    sagt_um: r.sagt_um,
    schritte_gesamt: r.schritte,
    am_ziel: r.geschafft,
    level: {
      nummer: level.nummer,
      titel: level.titel,
      breite: level.breite,
      hoehe: level.hoehe,
      ziel: level.ziel,
      hindernisse: level.hindernisse,
    },
    freigeschaltete_level: spieler.hoechstesLevel,
    anzahl_level: LEVELS.length,
  };
}
