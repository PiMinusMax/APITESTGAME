import { el } from '../ui.js';
import { store } from '../zustand.js';
import { KAPITEL } from '../kapitel/index.js';

const KOENNEN = [
  'erklären, was Schnittstellen und APIs sind',
  'HTTP-Anfragen und -Antworten lesen: Methode, URL, Header, Body, Statuscode',
  'JSON und XML lesen, schreiben und reparieren',
  'die Entwicklerwerkzeuge des Browsers zur Fehlersuche nutzen',
  'mit fetch, der Werkstatt und curl eigene Anfragen schicken',
  'mit API-Keys und Tokens sicher umgehen',
  'REST-, SOAP- und GraphQL-Schnittstellen benutzen',
  'eine Integration über mehrere Systeme durchführen',
];

export function zeigeZertifikat(main) {
  const fertig = KAPITEL.filter((k) => store.kapitelFertig(k.id));
  const d = store.daten;

  if (fertig.length < KAPITEL.length) {
    const offen = KAPITEL.filter((k) => !store.kapitelFertig(k.id));
    main.replaceChildren(
      el(
        'section',
        { class: 'gesperrt-seite' },
        el('div', { class: 'abschluss-icon', 'aria-hidden': 'true' }, '🏆'),
        el('h1', {}, 'Dein Zertifikat'),
        el('p', {}, `Du hast ${fertig.length} von ${KAPITEL.length} Kapiteln abgeschlossen. Schließe alle Kapitel ab, um deine Urkunde zu bekommen!`),
        el('p', {}, 'Noch offen:'),
        el('ul', { style: 'display:inline-block;text-align:left' }, offen.map((k) => el('li', {}, el('a', { href: `#/kapitel/${k.id}` }, `Kapitel ${k.nummer}: ${k.titel}`)))),
      ),
    );
    return;
  }

  const rang = store.rang();
  const name = el('input', { type: 'text', value: d.name, 'aria-label': 'Name auf der Urkunde', maxlength: 40 });
  const namensZeile = el('div', { class: 'name' }, d.name || 'Dein Name');
  name.addEventListener('input', () => {
    store.setzeName(name.value);
    namensZeile.textContent = name.value || 'Dein Name';
  });

  const letzteAufgabe = Object.values(d.aufgaben).map((a) => a.zeit).sort().at(-1);
  const datum = new Date(letzteAufgabe ?? Date.now()).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

  main.replaceChildren(
    el('div', { class: 'nicht-drucken' }, el('h1', {}, '🏆 Dein Zertifikat'), el('p', {}, 'Du hast es geschafft! Trag deinen Namen ein und drucke die Urkunde aus (oder speichere sie als PDF).'),
      el('div', { class: 'name-form', style: 'justify-content:flex-start' }, name, el('button', { type: 'button', class: 'knopf knopf-primaer', onclick: () => window.print() }, '🖨️ Drucken / als PDF speichern')),
    ),
    el(
      'section',
      { class: 'zertifikat' },
      el('div', { class: 'siegel', 'aria-hidden': 'true' }, '🛰️'),
      el('h1', {}, 'Urkunde'),
      el('p', {}, 'Hiermit wird bestätigt, dass'),
      namensZeile,
      el('p', {}, el('strong', {}, `alle ${KAPITEL.length} Kapitel von „Mission Schnittstelle“`), ' erfolgreich abgeschlossen hat und jetzt'),
      el('ul', {}, KOENNEN.map((x) => el('li', {}, x))),
      el('p', {}, 'kann.'),
      el('div', { class: 'zertifikat-fuss' },
        el('span', {}, `📅 ${datum}`),
        el('span', {}, `⭐ ${d.xp} XP · ${rang.icon} ${rang.titel}`),
        el('span', {}, '🎓 Lernspiel-Urkunde'),
      ),
    ),
  );
}
