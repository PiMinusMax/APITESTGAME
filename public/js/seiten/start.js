import { el } from '../ui.js';
import { store } from '../zustand.js';
import { KAPITEL } from '../kapitel/index.js';

export function zeigeStart(main) {
  const d = store.daten;
  const naechstes = KAPITEL.find((k) => !store.kapitelFertig(k.id));
  const begonnen = Object.keys(d.aufgaben).length > 0;

  const name = el('input', { type: 'text', value: d.name, placeholder: 'Dein Vorname oder Spitzname', 'aria-label': 'Dein Name', maxlength: 40 });
  const formular = el(
    'form',
    { class: 'name-form' },
    name,
    el('button', { type: 'submit', class: 'knopf knopf-primaer knopf-gross' }, begonnen ? 'Weiterspielen →' : 'Los geht’s! 🚀'),
  );
  formular.addEventListener('submit', (e) => {
    e.preventDefault();
    if (name.value.trim()) store.setzeName(name.value);
    location.hash = `#/kapitel/${(naechstes ?? KAPITEL[0]).id}`;
  });

  const zuruecksetzen = el('button', {
    type: 'button',
    class: 'knopf knopf-klein',
    onclick: () => {
      if (confirm('Wirklich den gesamten Spielstand in diesem Browser löschen? Das kann nicht rückgängig gemacht werden.')) {
        store.zuruecksetzen();
        location.hash = '#/';
        location.reload();
      }
    },
  }, '🗑️ Spielstand zurücksetzen');

  main.replaceChildren(
    el(
      'section',
      { class: 'start-held' },
      el('div', { class: 'gross-icon', 'aria-hidden': 'true' }, '🛰️'),
      el('h1', {}, 'Mission Schnittstelle'),
      el('p', {}, 'Das Lernspiel für alle, die verstehen wollen, wie Programme miteinander reden. Ohne Vorkenntnisse – Schritt für Schritt, mit echten Anfragen und den Werkzeugen der Profis.'),
      el('p', { class: 'klein' }, begonnen ? `Willkommen zurück${d.name ? `, ${d.name}` : ''}! Du hast schon ${d.xp} XP gesammelt.` : 'Wie dürfen wir dich nennen? (Bleibt nur in deinem Browser gespeichert.)'),
      formular,
    ),
    el('div', { class: 'box box-achtung mobil-hinweis', html: '<div class="box-titel">📱 Du bist am Handy?</div>Die ersten Kapitel klappen auch hier. Für die Aufgaben mit den Entwicklerwerkzeugen brauchst du aber einen Computer mit Chrome, Edge oder Firefox.' }),
    el(
      'div',
      { class: 'start-karten' },
      karte('📚', '13 Kapitel', 'Von „Was ist eine Schnittstelle?“ über HTTP, JSON und REST bis zu SOAP, GraphQL und deinem ersten Integrationsauftrag.'),
      karte('📨', 'Echte Anfragen', 'Hinter diesem Spiel steckt eine echte API. Alles, was du schickst, kommt wirklich beim Server an.'),
      karte('🛠️', 'Profi-Werkzeuge', 'Du lernst die Entwicklerwerkzeuge deines Browsers kennen – und steuerst diese Seite über die Konsole.'),
      karte('🏆', 'XP & Zertifikat', 'Für jede Aufgabe gibt es Erfahrungspunkte. Am Ende wartet deine persönliche Urkunde.'),
    ),
    el(
      'section',
      { class: 'kasten' },
      el('h2', {}, 'So funktioniert’s'),
      el('ol', {},
        el('li', { html: 'Jedes Kapitel besteht aus kurzen <strong>Schritten</strong>. Lies sie in Ruhe und klicke auf <strong>„Weiter“</strong>.' }),
        el('li', { html: '<strong>Aufgaben 🎯</strong> und <strong>Quizze 🧠</strong> geben den nächsten Schritt frei. Hängst du fest? Es gibt Tipps 💡 – und notfalls die Lösung.' }),
        el('li', { html: 'Fachbegriffe sind <span class="g" data-g="api" tabindex="0">gepunktet unterstrichen</span>. Fahr mit der Maus darüber, dann siehst du eine Erklärung.' }),
        el('li', { html: 'Unten rechts wartet die <strong>🧰 Werkstatt</strong>, mit der du eigene Anfragen baust.' }),
        el('li', { html: 'Dein Fortschritt wird automatisch in diesem Browser gespeichert.' }),
      ),
      el('p', { class: 'klein', html: 'Am besten spielst du auf einem Computer mit <strong>Chrome</strong>, <strong>Edge</strong> oder <strong>Firefox</strong>. Alle Daten im Spiel sind ausgedacht.' }),
      begonnen ? zuruecksetzen : null,
    ),
  );
}

function karte(icon, titel, text) {
  return el('div', { class: 'start-karte' }, el('div', { class: 'gross', 'aria-hidden': 'true' }, icon), el('h3', {}, titel), el('p', {}, text));
}
