import { el, formatiereBody } from '../ui.js';
import { intern } from '../api-client.js';
import { statusInfo } from '../daten/statuscodes.js';

/** Animierte erste Anfrage: Browser → Server → Browser. */
export function ersteAnfrage(ziel, api) {
  const paket = el('div', { class: 'flug-paket', 'aria-hidden': 'true' }, '📨');
  const buehne = el(
    'div',
    { class: 'flug' },
    el('div', { class: 'flug-ende' }, el('div', { class: 'flug-icon' }, '💻'), el('strong', {}, 'Dein Browser'), el('small', {}, 'der Client')),
    el('div', { class: 'flug-bahn' }, paket),
    el('div', { class: 'flug-ende' }, el('div', { class: 'flug-icon' }, '🖥️'), el('strong', {}, 'Server'), el('small', {}, location.host)),
  );
  const knopf = el('button', { type: 'button', class: 'knopf knopf-primaer knopf-gross' }, '📨 Anfrage senden');
  const details = el('div', { class: 'flug-details', 'aria-live': 'polite' });
  ziel.append(buehne, el('div', { class: 'zentriert' }, knopf), details);

  const warte = (ms) => new Promise((r) => setTimeout(r, ms));

  knopf.addEventListener('click', async () => {
    knopf.disabled = true;
    details.replaceChildren(
      el('div', { class: 'nachricht-karte anfrage-karte' },
        el('div', { class: 'karten-titel' }, '📤 Anfrage (vom Browser zum Server)'),
        el('div', { class: 'karten-zeile', html: '<span class="methode methode-get">GET</span> <code>/api/hallo</code>' }),
        el('small', {}, '„Hallo Server, gib mir bitte, was unter /api/hallo liegt.“'),
      ),
    );
    paket.textContent = '📨';
    paket.className = 'flug-paket hin';
    try {
      const [res] = await Promise.all([intern('/api/hallo'), warte(900)]);
      const text = await res.text();
      paket.textContent = '📦';
      paket.className = 'flug-paket zurueck';
      await warte(900);
      const info = statusInfo(res.status);
      details.append(
        el('div', { class: 'nachricht-karte antwort-karte' },
          el('div', { class: 'karten-titel' }, '📥 Antwort (vom Server zurück)'),
          el('div', { class: 'karten-zeile' }, el('span', { class: `status-pille status-${String(res.status)[0]}` }, `${res.status} ${info.name}`), ` ${info.kurz}`),
          el('pre', { class: 'mini-pre', html: `<code>${formatiereBody(text, res.headers.get('content-type') ?? '').html}</code>` }),
        ),
      );
      paket.className = 'flug-paket';
      api.erledigt();
    } catch {
      details.append(el('p', { class: 'box box-achtung' }, 'Der Server hat nicht geantwortet. Läuft er? Versuch es gleich noch einmal.'));
    }
    knopf.disabled = false;
    knopf.textContent = '📨 Nochmal senden';
  });
}
