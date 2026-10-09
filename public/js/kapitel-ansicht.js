// Zeigt ein Kapitel Schritt für Schritt an. Aufgaben und Quizze geben den nächsten Schritt frei.
import { el, konfetti, scrolleZu } from './ui.js';
import { store } from './zustand.js';
import { renderQuiz } from './komponenten/quiz.js';
import { renderAufgabe } from './komponenten/aufgabe.js';
import { KAPITEL } from './kapitel/index.js';

const KAPITEL_XP = 50;

const blockiert = (s) => (s.typ === 'quiz' || s.typ === 'aufgabe') && !s.optional;
const schrittFertig = (s) => !blockiert(s) || store.istErledigt(s.id);

export function pflichtErledigt(kapitel) {
  return kapitel.schritte.every(schrittFertig);
}

export function kapitelFortschritt(kapitel) {
  const n = kapitel.schritte.length;
  const erreicht = Math.min(store.schritt(kapitel.id), n - 1);
  const fertige = kapitel.schritte.filter((s, i) => i < erreicht || (i === erreicht && schrittFertig(s))).length;
  return Math.round((fertige / n) * 100);
}

export function zeigeKapitel(main, kapitel, kontext) {
  const position = KAPITEL.indexOf(kapitel);
  const n = kapitel.schritte.length;
  let erreicht = Math.min(store.schritt(kapitel.id), n - 1);
  const karten = [];

  const balken = el('div', { class: 'fortschritt-balken' }, el('div'));
  const kopf = el(
    'header',
    { class: 'kapitel-kopf' },
    el('div', { class: 'kapitel-ueberzeile' }, `Kapitel ${kapitel.nummer} von ${KAPITEL.length}`),
    el('h1', {}, el('span', { class: 'kapitel-icon', 'aria-hidden': 'true' }, kapitel.icon), ' ', kapitel.titel),
    el('p', { class: 'kapitel-unterzeile' }, kapitel.untertitel),
    kapitel.ziele?.length
      ? el('div', { class: 'lernziele' }, el('strong', {}, 'Das lernst du hier: '), el('ul', {}, kapitel.ziele.map((z) => el('li', { html: z }))))
      : null,
    balken,
  );
  const liste = el('div', { class: 'schritte' });
  const abschluss = el('div', { class: 'kapitel-abschluss-bereich' });
  main.replaceChildren(kopf, liste, abschluss);

  for (let i = 0; i <= erreicht; i++) liste.append(baueSchritt(i));
  aktualisiere();

  function baueSchritt(i) {
    const s = kapitel.schritte[i];
    const karte = el('section', { class: `schritt schritt-${s.typ}`, 'aria-labelledby': `schritt-titel-${i}`, dataset: s.id ? { id: s.id } : null });
    karte.append(el('div', { class: 'schritt-nummer' }, `Schritt ${i + 1} von ${n}`));
    karte.append(el('h2', { id: `schritt-titel-${i}` }, s.titel ?? (s.typ === 'quiz' ? 'Kurzer Wissens-Check' : '')));
    const inhalt = el('div', { class: 'schritt-inhalt' });
    karte.append(inhalt, el('div', { class: 'schritt-fuss' }));
    // Vor dem Inhalt registrieren: Aufgaben können schon beim Anzeigen fertig sein.
    karten[i] = karte;

    const fertig = () => aktualisiere();
    if (s.typ === 'quiz') renderQuiz(inhalt, s, { fertig });
    else if (s.typ === 'aufgabe') renderAufgabe(inhalt, s, { fertig, kontext });
    else {
      if (s.html) inhalt.innerHTML = s.html;
      if (s.render) {
        const ziel = el('div', { class: 'komponente' });
        inhalt.append(ziel);
        s.render(ziel, kontext);
      }
      if (s.htmlDanach) inhalt.append(el('div', { html: s.htmlDanach }));
    }
    return karte;
  }

  function aktualisiere() {
    if (!karten[erreicht]) return; // Kapitel wird gerade noch aufgebaut
    karten.forEach((k) => k.querySelector('.schritt-fuss').replaceChildren());
    balken.firstChild.style.width = `${kapitelFortschritt(kapitel)}%`;
    const s = kapitel.schritte[erreicht];
    const fuss = karten[erreicht].querySelector('.schritt-fuss');

    if (erreicht < n - 1) {
      const frei = schrittFertig(s);
      fuss.append(el('button', { type: 'button', class: 'knopf knopf-primaer knopf-weiter', disabled: !frei, onclick: weiter }, 'Weiter →'));
      if (!frei) fuss.append(el('span', { class: 'weiter-hinweis' }, s.typ === 'quiz' ? 'Beantworte zuerst alle Fragen.' : 'Löse zuerst die Aufgabe.'));
      abschluss.replaceChildren();
      return;
    }
    if (pflichtErledigt(kapitel)) zeigeAbschluss();
  }

  function weiter() {
    erreicht++;
    store.setzeSchritt(kapitel.id, erreicht);
    const karte = baueSchritt(erreicht);
    liste.append(karte);
    aktualisiere();
    scrolleZu(karte);
  }

  function zeigeAbschluss() {
    const neu = store.erledige(`kapitel:${kapitel.id}`, KAPITEL_XP, `Kapitel ${kapitel.nummer} abgeschlossen`);
    if (neu) konfetti();
    const naechstes = KAPITEL[position + 1];
    abschluss.replaceChildren(
      el(
        'section',
        { class: 'kapitel-abschluss' },
        el('div', { class: 'abschluss-icon', 'aria-hidden': 'true' }, '🎉'),
        el('h2', {}, `Kapitel ${kapitel.nummer} geschafft!`),
        kapitel.merksaetze?.length
          ? el('div', { class: 'merksaetze' }, el('h3', {}, 'Das nimmst du mit:'), el('ul', {}, kapitel.merksaetze.map((x) => el('li', { html: x }))))
          : null,
        naechstes
          ? el('a', { class: 'knopf knopf-primaer knopf-gross', href: `#/kapitel/${naechstes.id}` }, `Weiter zu Kapitel ${naechstes.nummer}: ${naechstes.titel} →`)
          : el('a', { class: 'knopf knopf-primaer knopf-gross', href: '#/zertifikat' }, '🏆 Zu deinem Zertifikat'),
      ),
    );
    if (neu) setTimeout(() => scrolleZu(abschluss), 300);
  }
}

export function zeigeGesperrt(main, kapitel) {
  const vorher = KAPITEL.find((k) => !store.kapitelFertig(k.id));
  main.replaceChildren(
    el(
      'section',
      { class: 'gesperrt-seite' },
      el('div', { class: 'abschluss-icon', 'aria-hidden': 'true' }, '🔒'),
      el('h1', {}, `Kapitel ${kapitel.nummer}: ${kapitel.titel}`),
      el('p', {}, 'Dieses Kapitel ist noch gesperrt. Die Kapitel bauen aufeinander auf – mach zuerst hier weiter:'),
      vorher ? el('a', { class: 'knopf knopf-primaer', href: `#/kapitel/${vorher.id}` }, `Zu Kapitel ${vorher.nummer}: ${vorher.titel}`) : null,
      el('p', { class: 'klein', html: 'Für Lehrkräfte: In der Konsole der Entwicklerwerkzeuge schaltet <code>spiel.alleKapitelFreischalten()</code> alle Kapitel frei.' }),
    ),
  );
}
