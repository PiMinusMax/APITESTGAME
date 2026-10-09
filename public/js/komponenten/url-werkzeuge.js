import { el, esc, formatiereBody } from '../ui.js';
import { intern } from '../api-client.js';
import { statusInfo } from '../daten/statuscodes.js';

const TEILE = [
  { text: 'https://', name: 'Protokoll', erklaerung: 'Wie wird gesprochen? <strong>https</strong> heißt: nach den HTTP-Regeln und verschlüsselt. Wie bei einem Brief: per Einschreiben statt Postkarte.' },
  { text: 'api.wetterdienst.example', name: 'Host / Domain', erklaerung: 'Welcher Computer im Internet? Das ist wie die <strong>Hausadresse</strong>. Oft beginnt sie bei APIs mit „api.“' },
  { text: ':443', name: 'Port', erklaerung: 'Welche <strong>Tür</strong> am Haus? 443 ist die Standardtür für https, 80 für http. Darum lässt man den Port meist weg.' },
  { text: '/v1/wetter', name: 'Pfad', erklaerung: 'Welches <strong>Zimmer</strong> im Haus? Der Pfad zeigt auf eine bestimmte Funktion oder Ressource der API. „v1“ ist die Version.' },
  { text: '?stadt=Berlin&einheit=celsius', name: 'Query-Parameter', erklaerung: '<strong>Zusatzwünsche</strong>. Sie beginnen mit <code>?</code>, bestehen aus <code>name=wert</code> und werden mit <code>&amp;</code> verbunden.' },
];

export function urlAnatomie(ziel) {
  const erklaerung = el('div', { class: 'url-erklaerung', 'aria-live': 'polite' }, '👆 Klicke auf einen farbigen Teil der Adresse.');
  const zeile = el('div', { class: 'url-zeile', role: 'group', 'aria-label': 'Bestandteile der URL' });
  TEILE.forEach((t, i) => {
    const b = el('button', { type: 'button', class: `url-teil url-farbe-${i + 1}` }, t.text);
    b.addEventListener('click', () => {
      zeile.querySelectorAll('.url-teil').forEach((x) => x.classList.remove('aktiv'));
      b.classList.add('aktiv');
      erklaerung.innerHTML = `<strong class="url-farbe-text-${i + 1}">${t.name}:</strong> ${t.erklaerung}`;
    });
    zeile.append(b);
  });
  const legende = el('div', { class: 'url-legende' }, TEILE.map((t, i) => el('span', { class: `url-legende-punkt url-farbe-${i + 1}` }, t.name)));
  ziel.append(el('div', { class: 'url-anatomie' }, zeile, legende, erklaerung));
}

/** Kleiner Wetter-Baukasten. Mit markiert=false wird ohne X-Quelle-Header gesendet. */
export function wetterBaukasten(ziel, { staedte = ['Berlin', 'Hamburg', 'Köln'], markiert = true } = {}) {
  const stadt = el('select', { 'aria-label': 'Stadt' }, staedte.map((s) => el('option', { value: s }, s)));
  const einheit = el('select', { 'aria-label': 'Einheit' }, el('option', { value: 'celsius' }, 'Celsius'), el('option', { value: 'fahrenheit' }, 'Fahrenheit'));
  const urlAnzeige = el('div', { class: 'url-live' });
  const knopf = el('button', { type: 'button', class: 'knopf knopf-primaer' }, '📨 Wetter abfragen');
  const ergebnis = el('div', { class: 'wetter-ergebnis', 'aria-live': 'polite' });

  const pfad = () => `/api/wetter?stadt=${encodeURIComponent(stadt.value)}&einheit=${einheit.value}`;
  const zeigeUrl = () => {
    urlAnzeige.innerHTML = `<span class="methode methode-get">GET</span> <code><span class="url-farbe-text-4">/api/wetter</span><span class="url-farbe-text-5">?stadt=${esc(stadt.value)}&amp;einheit=${esc(einheit.value)}</span></code>`;
  };
  stadt.addEventListener('change', zeigeUrl);
  einheit.addEventListener('change', zeigeUrl);
  zeigeUrl();

  knopf.addEventListener('click', async () => {
    knopf.disabled = true;
    try {
      const res = markiert ? await intern(pfad()) : await fetch(pfad());
      const text = await res.text();
      const info = statusInfo(res.status);
      let karte = null;
      try {
        const d = JSON.parse(text);
        if (res.ok) {
          karte = el('div', { class: 'wetter-karte' },
            el('div', { class: 'wetter-temp' }, `${d.temperatur} ${d.einheit}`),
            el('div', {}, el('strong', {}, d.stadt), ` · ${d.wetterlage}`),
            el('small', {}, `Wind ${d.wind_kmh} km/h · Luftfeuchtigkeit ${d.luftfeuchtigkeit_prozent} %`),
          );
        }
      } catch {
        /* keine Wetterkarte */
      }
      ergebnis.replaceChildren(
        el('div', { class: 'karten-zeile' }, el('span', { class: `status-pille status-${String(res.status)[0]}` }, `${res.status} ${info.name}`)),
        karte ?? '',
        el('details', { class: 'roh-daten' }, el('summary', {}, 'Rohdaten der Antwort (JSON) anzeigen'), el('pre', { class: 'mini-pre', html: `<code>${formatiereBody(text, 'json').html}</code>` })),
      );
    } catch {
      ergebnis.replaceChildren(el('p', {}, '❌ Keine Antwort vom Server.'));
    }
    knopf.disabled = false;
  });

  ziel.append(
    el('div', { class: 'baukasten' },
      el('div', { class: 'baukasten-zeile' }, el('label', {}, 'Stadt ', stadt), el('label', {}, 'Einheit ', einheit), knopf),
      urlAnzeige,
      ergebnis,
    ),
  );
}
