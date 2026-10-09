import { el, esc, m } from '../ui.js';
import { GRUPPEN } from '../daten/endpunkte.js';
import { server } from '../zustand.js';

export function zeigeHandbuch(main, kontext) {
  main.replaceChildren(
    el('h1', {}, '📘 API-Handbuch'),
    el('p', {}, 'Die „Speisekarte“ der Übungs-API: alle Endpunkte mit Methode, Adresse und Beschreibung. Mit „Ausprobieren“ landet die Anfrage direkt in der Werkstatt.'),
    el(
      'div',
      { class: 'box box-merke' },
      el('div', { class: 'box-titel' }, 'Gut zu wissen'),
      el('ul', {},
        el('li', { html: `Basis-Adresse: <code>${location.origin}</code>` }),
        el('li', { html: 'Fast alle Antworten sind JSON. Schickst du einen Body, gehört der Header <code>Content-Type: application/json</code> dazu.' }),
        el('li', { html: 'Fehler kommen mit passendem Statuscode und einer Erklärung im Feld <code>fehler</code> bzw. <code>nachricht</code>.' }),
        el('li', { html: 'Jede Antwort hat einen Header <code>X-Anfrage-ID</code> – praktisch für Fehlermeldungen.' }),
        el('li', {
          html: `Arbeitest du mit <strong>curl</strong> oder <strong>Postman</strong>? Dann schick deine Spieler-ID im Header mit: <code>X-Spieler-ID: ${server.spielerId ?? '…'}</code>`,
        }),
      ),
    ),
    ...GRUPPEN.map((gruppe) =>
      el(
        'section',
        { class: 'handbuch-gruppe' },
        el('h2', {}, gruppe.titel),
        ...gruppe.endpunkte.map((e) =>
          el(
            'div',
            { class: 'endpunkt' },
            el('div', { class: 'endpunkt-pfad', html: `${m(e.methode)} ${esc(e.pfad)}` }),
            e.vorlage ? el('button', { type: 'button', class: 'knopf knopf-klein', onclick: () => kontext.werkstatt.oeffnen(e.vorlage) }, '🧰 Ausprobieren') : el('span'),
            el('div', { class: 'endpunkt-text' }, e.beschreibung),
          ),
        ),
      ),
    ),
  );
}
