/**
 * Eine bewusst kleine GraphQL-Umsetzung für das Lernspiel.
 * Unterstützt: Abfragen (query) mit Feldern, verschachtelten Auswahlen,
 * Argumenten, Aliasen, Variablen und __typename. Keine Mutationen oder Fragmente.
 */
import { BESTELLUNGEN, KUNDEN, LAGER, PRODUKTE, bestellungenVon, kunde, produkt } from './daten.js';
import { normalisiere } from './hilfen.js';

export class GraphQLSyntaxFehler extends Error {}

// ---------- Schema ----------

const SKALARE = new Set(['Int', 'Float', 'String', 'Boolean', 'ID']);

const SCHEMA = {
  Query: {
    kunden: {
      typ: '[Kunde]',
      args: { stadt: 'String' },
      aufloesen: (_, a) => (a.stadt ? KUNDEN.filter((k) => normalisiere(k.stadt) === normalisiere(a.stadt)) : KUNDEN),
    },
    kunde: { typ: 'Kunde', args: { id: 'Int!' }, aufloesen: (_, a) => kunde(a.id) ?? null },
    produkte: { typ: '[Produkt]', aufloesen: () => PRODUKTE },
    produkt: { typ: 'Produkt', args: { artikelnummer: 'String!' }, aufloesen: (_, a) => produkt(a.artikelnummer) ?? null },
    bestellungen: { typ: '[Bestellung]', aufloesen: () => BESTELLUNGEN },
    bestellung: {
      typ: 'Bestellung',
      args: { nummer: 'String!' },
      aufloesen: (_, a) => BESTELLUNGEN.find((b) => b.nummer === String(a.nummer).toUpperCase()) ?? null,
    },
  },
  Kunde: {
    id: { typ: 'Int' },
    name: { typ: 'String' },
    email: { typ: 'String' },
    stadt: { typ: 'String' },
    kunde_seit: { typ: 'String' },
    bestellungen: { typ: '[Bestellung]', aufloesen: (k) => bestellungenVon(k.id) },
  },
  Bestellung: {
    nummer: { typ: 'String' },
    datum: { typ: 'String' },
    status: { typ: 'String' },
    gesamtbetrag: { typ: 'Float' },
    waehrung: { typ: 'String' },
    kunde: { typ: 'Kunde', aufloesen: (b) => kunde(b.kunde_id) },
    positionen: { typ: '[Position]' },
  },
  Position: {
    menge: { typ: 'Int' },
    einzelpreis: { typ: 'Float' },
    produkt: { typ: 'Produkt', aufloesen: (p) => produkt(p.artikelnummer) },
  },
  Produkt: {
    artikelnummer: { typ: 'String' },
    name: { typ: 'String' },
    preis: { typ: 'Float' },
    kategorie: { typ: 'String' },
    bestand: { typ: 'Int', aufloesen: (p) => LAGER[p.artikelnummer].bestand },
  },
};

function typInfo(typ) {
  const liste = typ.startsWith('[');
  const name = typ.replace(/[[\]!]/g, '');
  return { liste, name, skalar: SKALARE.has(name) };
}

// ---------- Zerlegen (Lexer) ----------

function zerlege(quelle) {
  const tokens = [];
  let i = 0;
  while (i < quelle.length) {
    const z = quelle[i];
    if (/[\s,﻿]/.test(z)) {
      i++;
      continue;
    }
    if (z === '#') {
      while (i < quelle.length && quelle[i] !== '\n') i++;
      continue;
    }
    if (quelle.startsWith('...', i)) {
      tokens.push({ art: 'p', wert: '...', pos: i });
      i += 3;
      continue;
    }
    if ('{}():!$=[]@'.includes(z)) {
      tokens.push({ art: 'p', wert: z, pos: i });
      i++;
      continue;
    }
    if (z === '"') {
      let j = i + 1;
      let text = '';
      while (j < quelle.length && quelle[j] !== '"') {
        if (quelle[j] === '\\') {
          const n = quelle[j + 1];
          text += { n: '\n', t: '\t', '"': '"', '\\': '\\', '/': '/' }[n] ?? n;
          j += 2;
        } else {
          text += quelle[j++];
        }
      }
      if (j >= quelle.length) throw new GraphQLSyntaxFehler(`Text ohne schließendes Anführungszeichen (Position ${i}).`);
      tokens.push({ art: 'text', wert: text, pos: i });
      i = j + 1;
      continue;
    }
    const zahl = quelle.slice(i).match(/^-?\d+(\.\d+)?([eE][+-]?\d+)?/);
    if (zahl) {
      tokens.push({ art: 'zahl', wert: Number(zahl[0]), pos: i });
      i += zahl[0].length;
      continue;
    }
    const name = quelle.slice(i).match(/^[_A-Za-z][_0-9A-Za-z]*/);
    if (name) {
      tokens.push({ art: 'name', wert: name[0], pos: i });
      i += name[0].length;
      continue;
    }
    throw new GraphQLSyntaxFehler(`Unerwartetes Zeichen "${z}" an Position ${i}.`);
  }
  return tokens;
}

// ---------- Parser ----------

function parse(quelle) {
  const t = zerlege(quelle);
  let p = 0;
  const blick = () => t[p];
  const ist = (wert) => t[p]?.art === 'p' && t[p].wert === wert;
  const erwarte = (wert) => {
    if (!ist(wert)) {
      const gefunden = t[p] ? `"${t[p].wert}"` : 'das Ende der Abfrage';
      throw new GraphQLSyntaxFehler(`Erwartet wurde "${wert}", gefunden: ${gefunden}.`);
    }
    p++;
  };
  const name = () => {
    if (t[p]?.art !== 'name') throw new GraphQLSyntaxFehler(`Hier wurde ein Name erwartet, gefunden: ${t[p] ? `"${t[p].wert}"` : 'nichts'}.`);
    return t[p++].wert;
  };

  function wert() {
    const tok = blick();
    if (!tok) throw new GraphQLSyntaxFehler('Unerwartetes Ende – ein Wert fehlt.');
    if (ist('$')) {
      p++;
      return { variable: name() };
    }
    if (ist('[')) {
      p++;
      const liste = [];
      while (!ist(']')) liste.push(wert());
      p++;
      return liste;
    }
    if (tok.art === 'text' || tok.art === 'zahl') {
      p++;
      return tok.wert;
    }
    if (tok.art === 'name') {
      p++;
      if (tok.wert === 'true') return true;
      if (tok.wert === 'false') return false;
      if (tok.wert === 'null') return null;
      return tok.wert;
    }
    throw new GraphQLSyntaxFehler(`Unerwartetes Zeichen "${tok.wert}" als Wert.`);
  }

  function argumente() {
    const args = {};
    if (!ist('(')) return args;
    p++;
    while (!ist(')')) {
      const n = name();
      erwarte(':');
      args[n] = wert();
    }
    p++;
    return args;
  }

  function auswahl() {
    erwarte('{');
    const felder = [];
    while (!ist('}')) {
      if (ist('...')) throw new GraphQLSyntaxFehler('Fragmente ("...") unterstützt diese Übungs-API nicht.');
      if (!blick()) throw new GraphQLSyntaxFehler('Es fehlt eine schließende Klammer "}".');
      let feldName = name();
      let alias = feldName;
      if (ist(':')) {
        p++;
        feldName = name();
      }
      const args = argumente();
      const unter = ist('{') ? auswahl() : null;
      felder.push({ alias, name: feldName, args, unter });
    }
    p++;
    if (!felder.length) throw new GraphQLSyntaxFehler('Eine Auswahl { } darf nicht leer sein.');
    return felder;
  }

  let operation = 'query';
  if (blick()?.art === 'name') {
    operation = name();
    if (operation !== 'query') {
      throw new GraphQLSyntaxFehler(
        operation === 'mutation' || operation === 'subscription'
          ? `"${operation}" unterstützt diese Übungs-API nicht – nur Abfragen (query).`
          : `Unbekanntes Schlüsselwort "${operation}". Eine Abfrage beginnt mit "{" oder "query".`,
      );
    }
    if (blick()?.art === 'name') name(); // Name der Abfrage (optional)
    if (ist('(')) {
      // Variablen-Definitionen überspringen, z. B. ($id: Int!)
      let tiefe = 0;
      do {
        if (ist('(')) tiefe++;
        if (ist(')')) tiefe--;
        p++;
      } while (tiefe > 0 && p < t.length);
    }
  }
  const felder = auswahl();
  if (p < t.length) throw new GraphQLSyntaxFehler(`Nach dem Ende der Abfrage steht noch "${t[p].wert}".`);
  return felder;
}

// ---------- Ausführen ----------

function setzeVariablen(wert, variablen) {
  if (wert && typeof wert === 'object' && 'variable' in wert) return variablen?.[wert.variable];
  if (Array.isArray(wert)) return wert.map((w) => setzeVariablen(w, variablen));
  return wert;
}

function fuehreAus(felder, typName, eltern, variablen, fehler, pfad) {
  const ergebnis = {};
  for (const feld of felder) {
    const feldPfad = [...pfad, feld.alias];
    if (feld.name === '__typename') {
      ergebnis[feld.alias] = typName;
      continue;
    }
    const definition = SCHEMA[typName][feld.name];
    if (!definition) {
      const verfuegbar = Object.keys(SCHEMA[typName]).join(', ');
      fehler.push({ message: `Das Feld "${feld.name}" gibt es beim Typ "${typName}" nicht. Verfügbar: ${verfuegbar}`, path: feldPfad });
      continue;
    }
    const info = typInfo(definition.typ);
    if (info.skalar && feld.unter) {
      fehler.push({ message: `"${feld.name}" ist ein einfacher Wert (${info.name}) – dahinter darf keine Auswahl { } stehen.`, path: feldPfad });
      continue;
    }
    if (!info.skalar && !feld.unter) {
      const beispiel = Object.keys(SCHEMA[info.name]).slice(0, 2).join(' ');
      fehler.push({
        message: `"${feld.name}" ist ein Objekt (${info.name}). Gib in { } an, welche Felder du willst, z. B. ${feld.name} { ${beispiel} }`,
        path: feldPfad,
      });
      continue;
    }
    const args = {};
    for (const [n, w] of Object.entries(feld.args)) args[n] = setzeVariablen(w, variablen);
    const erlaubteArgs = definition.args ?? {};
    const unbekannt = Object.keys(args).find((n) => !(n in erlaubteArgs));
    if (unbekannt) {
      fehler.push({ message: `Das Argument "${unbekannt}" gibt es bei "${feld.name}" nicht.`, path: feldPfad });
      continue;
    }
    const fehlt = Object.entries(erlaubteArgs).find(([n, typ]) => typ.endsWith('!') && args[n] === undefined);
    if (fehlt) {
      fehler.push({ message: `"${feld.name}" braucht das Argument "${fehlt[0]}" (${fehlt[1]}), z. B. ${feld.name}(${fehlt[0]}: 1)`, path: feldPfad });
      continue;
    }

    const wert = definition.aufloesen ? definition.aufloesen(eltern, args) : eltern?.[feld.name];
    if (wert === null || wert === undefined) {
      ergebnis[feld.alias] = null;
    } else if (info.skalar) {
      ergebnis[feld.alias] = wert;
    } else if (info.liste) {
      ergebnis[feld.alias] = wert.map((w, i) => fuehreAus(feld.unter, info.name, w, variablen, fehler, [...feldPfad, i]));
    } else {
      ergebnis[feld.alias] = fuehreAus(feld.unter, info.name, wert, variablen, fehler, feldPfad);
    }
  }
  return ergebnis;
}

/** Führt eine Abfrage aus. Wirft GraphQLSyntaxFehler bei kaputter Syntax. */
export function graphql(abfrage, variablen = {}) {
  const felder = parse(abfrage);
  const fehler = [];
  const data = fuehreAus(felder, 'Query', null, variablen, fehler, []);
  return fehler.length ? { data, errors: fehler } : { data };
}

export const SCHEMA_TEXT = `type Query {
  kunden(stadt: String): [Kunde]
  kunde(id: Int!): Kunde
  produkte: [Produkt]
  produkt(artikelnummer: String!): Produkt
  bestellungen: [Bestellung]
  bestellung(nummer: String!): Bestellung
}

type Kunde {
  id: Int
  name: String
  email: String
  stadt: String
  kunde_seit: String
  bestellungen: [Bestellung]
}

type Bestellung {
  nummer: String
  datum: String
  status: String
  gesamtbetrag: Float
  waehrung: String
  kunde: Kunde
  positionen: [Position]
}

type Position {
  menge: Int
  einzelpreis: Float
  produkt: Produkt
}

type Produkt {
  artikelnummer: String
  name: String
  preis: Float
  kategorie: String
  bestand: Int
}
`;
