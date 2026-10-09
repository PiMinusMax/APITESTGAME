import { el, mischen } from '../ui.js';
import { store } from '../zustand.js';

const XP_PRO_FRAGE = 10;

/**
 * Quiz mit Einfachauswahl. Falsche Antworten dürfen korrigiert werden –
 * es geht ums Lernen, nicht ums Durchfallen.
 */
export function renderQuiz(container, s, { fertig }) {
  const schonGeschafft = store.istErledigt(s.id);
  let offen = s.fragen.length;
  let ersterVersuch = 0;

  const box = el('div', { class: 'quiz' });
  const kopf = el('div', { class: 'quiz-kopf' }, el('span', { class: 'aufgabe-label' }, '🧠 Quiz'), el('span', { class: 'xp' }, `+${s.fragen.length * XP_PRO_FRAGE} XP`));
  box.append(kopf);
  if (s.intro) box.append(el('p', { html: s.intro }));

  const ergebnis = el('div', { class: 'quiz-ergebnis', 'aria-live': 'polite' });

  s.fragen.forEach((f, fi) => {
    const block = el('fieldset', { class: 'quiz-frage' }, el('legend', { html: `<span class="quiz-nr">${fi + 1}</span> ${f.frage}` }));
    const optionen = el('div', { class: 'quiz-optionen' });
    const rueckmeldung = el('div', { class: 'quiz-rueckmeldung', 'aria-live': 'polite' });
    let fehlversuche = 0;

    const reihenfolge = schonGeschafft ? f.antworten : mischen(f.antworten);
    reihenfolge.forEach((a) => {
      const knopf = el('button', { type: 'button', class: 'quiz-option', html: a.text });
      if (schonGeschafft) {
        knopf.disabled = true;
        if (a.richtig) knopf.classList.add('richtig');
      }
      knopf.addEventListener('click', () => {
        if (a.richtig) {
          knopf.classList.add('richtig');
          optionen.querySelectorAll('button').forEach((b) => (b.disabled = true));
          rueckmeldung.className = 'quiz-rueckmeldung ok';
          rueckmeldung.innerHTML = `✅ <strong>Richtig!</strong> ${f.erklaerung ?? ''}`;
          if (fehlversuche === 0) ersterVersuch++;
          offen--;
          if (offen === 0) abschliessen();
        } else {
          fehlversuche++;
          knopf.classList.add('falsch');
          knopf.disabled = true;
          rueckmeldung.className = 'quiz-rueckmeldung nein';
          rueckmeldung.innerHTML = `❌ <strong>Nicht ganz.</strong> ${a.warum ?? 'Versuch es noch einmal.'}`;
        }
      });
      optionen.append(knopf);
    });

    if (schonGeschafft && f.erklaerung) {
      rueckmeldung.className = 'quiz-rueckmeldung ok';
      rueckmeldung.innerHTML = `✅ ${f.erklaerung}`;
    }
    block.append(optionen, rueckmeldung);
    box.append(block);
  });

  function abschliessen() {
    const anzahl = s.fragen.length;
    ergebnis.innerHTML = `🎉 <strong>Quiz geschafft!</strong> ${ersterVersuch} von ${anzahl} Fragen hast du beim ersten Versuch richtig beantwortet.`;
    ergebnis.classList.add('sichtbar');
    store.erledige(s.id, anzahl * XP_PRO_FRAGE, 'Quiz geschafft');
    fertig();
  }

  if (schonGeschafft) {
    ergebnis.innerHTML = '✅ <strong>Dieses Quiz hast du schon geschafft.</strong>';
    ergebnis.classList.add('sichtbar');
  }
  box.append(ergebnis);
  container.append(box);
}
