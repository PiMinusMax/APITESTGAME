import { el } from '../ui.js';

const ABLAEUFE = {
  pizza: [
    { von: 'gast', nach: 'kellner', ding: '📝', alltag: 'Der Gast schaut in die Speisekarte und sagt dem Kellner: „Eine Pizza, bitte!“', technik: 'Die App schickt eine <strong>Anfrage</strong> an die API: „Gib mir eine Pizza.“' },
    { von: 'kellner', nach: 'kueche', ding: '📝', alltag: 'Der Kellner bringt die Bestellung in die Küche. Wie dort gekocht wird, muss der Gast nicht wissen.', technik: 'Die API reicht die Anfrage an den <strong>Server</strong> weiter. Wie der intern arbeitet, ist für die App egal.' },
    { von: 'kueche', nach: 'kueche', ding: '🍳', alltag: 'Die Küche bereitet die Pizza zu …', technik: 'Der Server holt die Daten (z. B. aus einer Datenbank) und baut die Antwort.' },
    { von: 'kueche', nach: 'kellner', ding: '🍕', alltag: 'Der Kellner holt die fertige Pizza ab …', technik: 'Die Antwort geht zurück an die API …' },
    { von: 'kellner', nach: 'gast', ding: '🍕', alltag: '… und bringt sie zum Gast. Guten Appetit! 😋', technik: '… und die API liefert die <strong>Antwort</strong> an die App: „Hier ist deine Pizza.“ ✅' },
  ],
  einhorn: [
    { von: 'gast', nach: 'kellner', ding: '📝', alltag: 'Der Gast bestellt: „Ein Einhorn-Steak, bitte!“', technik: 'Die App fragt nach etwas, das es in der API gar nicht gibt.' },
    { von: 'kellner', nach: 'gast', ding: '❌', alltag: 'Der Kellner: „Tut mir leid, das steht nicht auf der Karte.“ Die Küche wird gar nicht erst gefragt.', technik: 'Die API antwortet sofort mit einem Fehler: <strong>„Gibt es nicht“</strong>. Später lernst du: Das ist der Statuscode <strong>404 Not Found</strong>.' },
  ],
};

export function restaurant(ziel) {
  const stationen = {
    gast: { icon: '🧑', name: 'Gast', technik: 'Client (z. B. eine App)' },
    kellner: { icon: '🤵', name: 'Kellner', technik: 'API (die Schnittstelle)' },
    kueche: { icon: '👩‍🍳', name: 'Küche', technik: 'Server mit den Daten' },
  };
  const buehne = el('div', { class: 'restaurant-buehne' });
  const knoten = {};
  for (const [id, s] of Object.entries(stationen)) {
    knoten[id] = el(
      'div',
      { class: 'station', dataset: { station: id } },
      el('div', { class: 'station-icon', 'aria-hidden': 'true' }, s.icon),
      el('div', { class: 'station-name' }, s.name),
      el('div', { class: 'station-technik' }, s.technik),
    );
    buehne.append(knoten[id]);
  }
  const paket = el('div', { class: 'paket', 'aria-hidden': 'true' });
  buehne.append(paket);

  const text = el('p', { class: 'restaurant-text', 'aria-live': 'polite' }, 'Klicke auf „Bestellen“ und schau zu, was passiert.');
  const brille = el('input', { type: 'checkbox' });
  const pizza = el('button', { type: 'button', class: 'knopf knopf-primaer' }, '🍕 Pizza bestellen');
  const einhorn = el('button', { type: 'button', class: 'knopf' }, '🦄 Einhorn-Steak bestellen');
  const rahmen = el(
    'div',
    { class: 'restaurant' },
    buehne,
    text,
    el('div', { class: 'restaurant-knoepfe' }, pizza, einhorn, el('label', { class: 'schalter' }, brille, ' 🤓 Technik-Brille aufsetzen')),
  );
  ziel.append(rahmen);

  brille.addEventListener('change', () => rahmen.classList.toggle('technik', brille.checked));

  const mitte = (id) => knoten[id].offsetLeft + knoten[id].offsetWidth / 2;
  let laeuft = false;

  async function abspielen(name) {
    if (laeuft) return;
    laeuft = true;
    pizza.disabled = einhorn.disabled = true;
    const warte = (ms) => new Promise((r) => setTimeout(r, ms));
    paket.classList.add('sichtbar');
    for (const schritt of ABLAEUFE[name]) {
      paket.textContent = schritt.ding;
      paket.style.left = `${mitte(schritt.von)}px`;
      text.innerHTML = brille.checked ? schritt.technik : schritt.alltag;
      Object.values(knoten).forEach((k) => k.classList.remove('aktiv'));
      knoten[schritt.nach].classList.add('aktiv');
      await warte(60);
      paket.style.left = `${mitte(schritt.nach)}px`;
      await warte(2300);
    }
    Object.values(knoten).forEach((k) => k.classList.remove('aktiv'));
    paket.classList.remove('sichtbar');
    pizza.disabled = einhorn.disabled = false;
    laeuft = false;
  }

  pizza.addEventListener('click', () => abspielen('pizza'));
  einhorn.addEventListener('click', () => abspielen('einhorn'));
}
