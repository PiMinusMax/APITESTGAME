import { el, kopiereText } from '../ui.js';
import { intern } from '../api-client.js';

/** Zeigt den persönlichen API-Key – wie im Entwicklerportal eines echten Anbieters. */
export function entwicklerportal(ziel) {
  const wert = el('code', { class: 'schluessel-wert' }, 'wird geladen …');
  const knopf = el('button', { type: 'button', class: 'knopf knopf-klein', disabled: true }, '📋 Kopieren');
  ziel.append(
    el(
      'div',
      { class: 'portal' },
      el('div', { class: 'portal-titel' }, '🔑 Entwicklerportal · Dein persönlicher API-Key'),
      el('div', { class: 'portal-zeile' }, wert, knopf),
      el('small', {}, 'Im echten Leben bekommst du so einen Schlüssel nach der Registrierung bei einem Anbieter. Behandle ihn wie ein Passwort!'),
    ),
  );
  intern('/api/entwicklerportal')
    .then((r) => r.json())
    .then((d) => {
      wert.textContent = d.api_key;
      knopf.disabled = false;
      knopf.addEventListener('click', async () => {
        knopf.textContent = (await kopiereText(d.api_key)) ? '✅ Kopiert!' : '❌';
        setTimeout(() => (knopf.textContent = '📋 Kopieren'), 1500);
      });
    })
    .catch(() => (wert.textContent = 'Konnte den Schlüssel nicht laden.'));
}
