import { el } from '../ui.js';
import { intern } from '../api-client.js';

export function geheimnisKnopf(ziel) {
  const meldung = el('div', { class: 'geheim-meldung', 'aria-live': 'polite' });
  const knopf = el('button', { type: 'button', class: 'knopf knopf-primaer' }, '🔒 Geheimnis anfordern');
  knopf.addEventListener('click', async () => {
    knopf.disabled = true;
    try {
      const res = await intern('/api/geheimnis');
      await res.text();
      meldung.innerHTML = `✅ Die Antwort ist angekommen (Status ${res.status}). Den Inhalt zeige ich dir aber nicht 😉 – finde ihn selbst in den DevTools!`;
    } catch {
      meldung.textContent = '❌ Keine Antwort vom Server.';
    }
    knopf.disabled = false;
  });
  ziel.append(el('div', { class: 'geheim' }, knopf, meldung));
}

/** Ein Formular, dem absichtlich ein Pflichtfeld fehlt. Die Seite verrät nur „Fehler“. */
export function paketFormular(ziel) {
  const felder = {
    empfaenger: el('input', { value: 'Erika Mustermann', 'aria-label': 'Empfänger' }),
    strasse: el('input', { value: 'Musterweg 1', 'aria-label': 'Straße' }),
    ort: el('input', { value: 'Köln', 'aria-label': 'Ort' }),
  };
  const meldung = el('div', { class: 'geheim-meldung', 'aria-live': 'polite' });
  const knopf = el('button', { type: 'submit', class: 'knopf knopf-primaer' }, '📦 Paket abschicken');
  const formular = el(
    'form',
    { class: 'paket-formular' },
    el('label', {}, 'Empfänger', felder.empfaenger),
    el('label', {}, 'Straße', felder.strasse),
    el('label', {}, 'Ort', felder.ort),
    knopf,
  );
  formular.addEventListener('submit', async (e) => {
    e.preventDefault();
    knopf.disabled = true;
    try {
      const res = await intern('/api/paket', {
        method: 'POST',
        json: { empfaenger: felder.empfaenger.value, strasse: felder.strasse.value, ort: felder.ort.value },
      });
      await res.text();
      meldung.className = res.ok ? 'geheim-meldung ok' : 'geheim-meldung nein';
      meldung.textContent = res.ok ? '✅ Paket verschickt.' : '❌ Hoppla, das hat nicht geklappt. Bitte versuchen Sie es später erneut.';
    } catch {
      meldung.textContent = '❌ Keine Antwort vom Server.';
    }
    knopf.disabled = false;
  });
  ziel.append(el('div', { class: 'app-attrappe' }, el('div', { class: 'app-titel' }, '🚚 Versand-App (Übung)'), formular, meldung));
}
