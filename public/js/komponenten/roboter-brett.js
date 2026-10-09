import { el, esc } from '../ui.js';
import { server, store } from '../zustand.js';
import { intern } from '../api-client.js';
import { quelleText } from '../werkstatt.js';

const ROBOTER_SVG = `<svg viewBox="0 0 64 64" aria-hidden="true">
  <line x1="32" y1="6" x2="32" y2="14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  <circle cx="32" cy="5" r="4" fill="#ffd43b" stroke="currentColor" stroke-width="2"/>
  <rect x="12" y="14" width="40" height="28" rx="9" fill="var(--robo-farbe)" stroke="currentColor" stroke-width="3"/>
  <circle cx="24" cy="28" r="5" fill="#fff" stroke="currentColor" stroke-width="2"/>
  <circle cx="40" cy="28" r="5" fill="#fff" stroke="currentColor" stroke-width="2"/>
  <circle class="pupille" cx="26" cy="28" r="2.2" fill="currentColor"/>
  <circle class="pupille" cx="42" cy="28" r="2.2" fill="currentColor"/>
  <rect x="18" y="44" width="28" height="14" rx="5" fill="var(--robo-farbe)" stroke="currentColor" stroke-width="3"/>
  <line x1="8" y1="50" x2="18" y2="50" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  <line x1="46" y1="50" x2="56" y2="50" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
</svg>`;

const SPRECHDAUER_MS = 12000;

export function roboterBrett(ziel, kontext) {
  const kopf = el('div', { class: 'robo-kopf' });
  const achseX = el('div', { class: 'robo-achse-x', 'aria-hidden': 'true' });
  const achseY = el('div', { class: 'robo-achse-y', 'aria-hidden': 'true' });
  const feld = el('div', { class: 'robo-feld', role: 'img' });
  const figur = el('div', { class: 'robo-figur', html: ROBOTER_SVG });
  const blase = el('div', { class: 'robo-blase', hidden: true });
  figur.append(blase);
  const ziel_ = el('div', { class: 'robo-geschafft', hidden: true });
  const meldung = el('div', { class: 'robo-meldung', 'aria-live': 'polite' }, 'Warte auf Befehle … 📡');

  ziel.append(
    el(
      'div',
      { class: 'robo' },
      kopf,
      el('div', { class: 'robo-gitter' }, el('div', { class: 'robo-ecke', 'aria-hidden': 'true' }, 'y \\ x'), achseX, achseY, el('div', { class: 'robo-feld-rahmen' }, feld, ziel_)),
      meldung,
    ),
  );

  let aufgebautFuer = null;
  let blasenTimer;

  function baueFeld(r) {
    const { breite, hoehe, hindernisse, ziel: z } = r.level;
    feld.style.setProperty('--breite', breite);
    feld.style.setProperty('--hoehe', hoehe);
    achseX.style.setProperty('--breite', breite);
    achseY.style.setProperty('--hoehe', hoehe);
    achseX.replaceChildren(...Array.from({ length: breite }, (_, i) => el('span', {}, String(i))));
    achseY.replaceChildren(...Array.from({ length: hoehe }, (_, i) => el('span', {}, String(i))));
    const zellen = [];
    for (let y = 0; y < hoehe; y++) {
      for (let x = 0; x < breite; x++) {
        const mauer = hindernisse.some((h) => h.x === x && h.y === y);
        const istZiel = z.x === x && z.y === y;
        zellen.push(el('div', { class: `robo-zelle${mauer ? ' mauer' : ''}${istZiel ? ' zielfeld' : ''}` }, mauer ? '🧱' : istZiel ? '⭐' : ''));
      }
    }
    feld.replaceChildren(...zellen, figur);
    aufgebautFuer = `${r.level.nummer}`;
  }

  function zeichne(r) {
    if (!r) return;
    if (aufgebautFuer !== `${r.level.nummer}`) baueFeld(r);
    feld.setAttribute('aria-label', `Spielfeld Level ${r.level.nummer}: ${r.name} steht auf x=${r.position.x}, y=${r.position.y}. Ziel auf x=${r.level.ziel.x}, y=${r.level.ziel.y}.`);
    figur.style.setProperty('--x', r.position.x);
    figur.style.setProperty('--y', r.position.y);
    figur.style.setProperty('--robo-farbe', r.farbe);
    figur.classList.toggle('blick-links', r.blickrichtung === 'links');
    kopf.innerHTML = `<span><strong>Level ${r.level.nummer}</strong> von ${r.anzahl_level}: ${esc(r.level.titel)}</span><span>🤖 ${esc(r.name)}</span><span>📍 x=${r.position.x}, y=${r.position.y}</span><span>👣 ${r.schritte_gesamt} Schritte</span>`;

    const frisch = r.sagt && r.sagt_um && Date.now() - new Date(r.sagt_um).getTime() < SPRECHDAUER_MS;
    clearTimeout(blasenTimer);
    blase.hidden = !frisch;
    blase.textContent = r.sagt;
    if (frisch) blasenTimer = setTimeout(() => (blase.hidden = true), SPRECHDAUER_MS);

    ziel_.hidden = !r.am_ziel;
    if (r.am_ziel) {
      const naechstes = r.level.nummer < r.anzahl_level ? r.level.nummer + 1 : null;
      ziel_.innerHTML = naechstes
        ? `<div>⭐ Level ${r.level.nummer} geschafft!</div><small>Nächstes Level: <code>POST /api/roboter/neustart</code> mit Body <code>{ "level": ${naechstes} }</code></small>`
        : '<div>🏆 Alle Level geschafft!</div><small>Mit <code>POST /api/roboter/neustart</code> kannst du nochmal spielen.</small>';
    }
  }

  kontext.aufraeumen(
    store.abonnieren((typ, d) => {
      if (typ !== 'roboter') return;
      zeichne(d.zustand ?? server.roboter);
      if (d.meldung) {
        meldung.innerHTML = '';
        meldung.append(
          el('strong', {}, '📡 Befehl empfangen'),
          d.quelle ? ` (${quelleText(d.quelle)})` : '',
          el('br'),
          d.meldung,
        );
        meldung.classList.remove('blinken');
        void meldung.offsetWidth;
        meldung.classList.add('blinken');
      }
    }),
  );

  if (server.roboter) zeichne(server.roboter);
  else
    intern('/api/roboter')
      .then((r) => r.json())
      .then((r) => {
        server.roboter = r;
        zeichne(r);
      })
      .catch(() => (meldung.textContent = 'Keine Verbindung zum Server.'));
}
