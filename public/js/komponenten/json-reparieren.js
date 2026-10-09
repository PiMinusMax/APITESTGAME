import { el, esc } from '../ui.js';

const KAPUTT = [
  { text: '{ name: "Bit", "farbe": "blau" }', soll: { name: 'Bit', farbe: 'blau' } },
  { text: '{\n  "stadt": "Berlin"\n  "plz": "10115"\n}', soll: { stadt: 'Berlin', plz: '10115' } },
  { text: '{\n  "titel": "Einkaufen",\n  "erledigt": false,\n}', soll: { titel: 'Einkaufen', erledigt: false } },
  { text: "{ 'hobby': 'Lesen', 'seiten': 320 }", soll: { hobby: 'Lesen', seiten: 320 } },
];

/** Typische Fehler erkennen und auf Deutsch erklären. */
function diagnose(text) {
  if (/'/.test(text)) return 'Es gibt einfache Anführungszeichen \' – JSON erlaubt nur doppelte ".';
  if (/,\s*[}\]]/.test(text)) return 'Nach dem letzten Eintrag steht ein Komma. Das ist in JSON verboten.';
  if (/[{,]\s*[A-Za-z_]\w*\s*:/.test(text)) return 'Ein Schlüssel steht ohne Anführungszeichen. Schlüssel immer in "…" schreiben.';
  if (/("|\d|true|false|null|[}\]])\s*\n?\s*"/.test(text)) return 'Zwischen zwei Einträgen fehlt ein Komma.';
  return 'Irgendwo stimmt die Syntax nicht. Prüfe Klammern, Kommas und Anführungszeichen.';
}

function gleich(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function jsonReparieren(ziel, api) {
  const geschafft = new Set();
  const liste = el('div', { class: 'reparatur-liste' });

  KAPUTT.forEach((k, i) => {
    const feld = el('textarea', { class: 'reparatur-feld', spellcheck: 'false', rows: k.text.split('\n').length + 1, 'aria-label': `Kaputtes JSON Nummer ${i + 1}` });
    feld.value = k.text;
    const status = el('div', { class: 'reparatur-status', 'aria-live': 'polite' });
    const pruefe = () => {
      let daten;
      try {
        daten = JSON.parse(feld.value);
      } catch (e) {
        geschafft.delete(i);
        status.className = 'reparatur-status nein';
        status.innerHTML = `❌ ${esc(diagnose(feld.value))} <small>(${esc(e.message)})</small>`;
        return;
      }
      if (!gleich(daten, k.soll)) {
        geschafft.delete(i);
        status.className = 'reparatur-status halb';
        status.textContent = '🤔 Gültiges JSON – aber der Inhalt hat sich verändert. Repariere nur die Syntax, ändere keine Werte.';
        return;
      }
      geschafft.add(i);
      status.className = 'reparatur-status ok';
      status.textContent = '✅ Repariert!';
      if (geschafft.size === KAPUTT.length) api.erledigt();
    };
    feld.addEventListener('input', pruefe);
    pruefe();
    liste.append(el('div', { class: 'reparatur' }, el('div', { class: 'reparatur-nr' }, `#${i + 1}`), el('div', { class: 'reparatur-inhalt' }, feld, status)));
  });
  ziel.append(liste);
}
