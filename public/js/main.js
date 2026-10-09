// Einstiegspunkt: Navigation, Kopfzeile, Routing und alles, was global läuft.
import { aktiviereKopierknoepfe, el, esc, m } from './ui.js';
import { server, store } from './zustand.js';
import { verbindeLive } from './api-client.js';
import { quelleText, werkstatt } from './werkstatt.js';
import { KAPITEL, kapitelFrei } from './kapitel/index.js';
import { kapitelFortschritt, zeigeGesperrt, zeigeKapitel } from './kapitel-ansicht.js';
import { zeigeStart } from './seiten/start.js';
import { zeigeHandbuch } from './seiten/handbuch.js';
import { zeigeGlossar } from './seiten/glossar.js';
import { zeigeZertifikat } from './seiten/zertifikat.js';
import { begruessung, installiereSpiel } from './konsole.js';
import { GLOSSAR_MAP } from './daten/glossar.js';

const main = document.getElementById('inhalt');
const nav = document.getElementById('navigation');
const kopfStatus = document.getElementById('kopf-status');
const menueKnopf = document.getElementById('menue-knopf');

let aufraeumer = [];
const kontext = {
  werkstatt,
  aufraeumen: (fn) => aufraeumer.push(fn),
};

// ---------- Routing ----------

function route() {
  aufraeumer.forEach((fn) => fn());
  aufraeumer = [];
  const [, bereich, id] = (location.hash || '#/').split('/');

  if (bereich === 'kapitel') {
    const index = KAPITEL.findIndex((k) => k.id === id);
    if (index < 0) return (location.hash = '#/');
    const kapitel = KAPITEL[index];
    document.title = `${kapitel.titel} – Mission Schnittstelle`;
    if (kapitelFrei(index)) zeigeKapitel(main, kapitel, kontext);
    else zeigeGesperrt(main, kapitel);
  } else if (bereich === 'handbuch') {
    document.title = 'API-Handbuch – Mission Schnittstelle';
    zeigeHandbuch(main, kontext);
  } else if (bereich === 'glossar') {
    document.title = 'Glossar – Mission Schnittstelle';
    zeigeGlossar(main);
  } else if (bereich === 'zertifikat') {
    document.title = 'Zertifikat – Mission Schnittstelle';
    zeigeZertifikat(main);
  } else {
    document.title = 'Mission Schnittstelle – Das API-Lernspiel';
    zeigeStart(main);
  }
  zeichneNavigation();
  schliesseMenue();
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
}

// ---------- Navigation ----------

function navLink(href, inhalt, klassen = '') {
  const aktiv = location.hash === href || (href === '#/' && !location.hash);
  return el('a', { href, class: `nav-link${aktiv ? ' aktiv' : ''} ${klassen}`, 'aria-current': aktiv ? 'page' : null }, ...inhalt);
}

function zeichneNavigation() {
  const kapitelListe = KAPITEL.map((k, i) => {
    const frei = kapitelFrei(i);
    const fertig = store.kapitelFertig(k.id);
    const prozent = frei && !fertig ? kapitelFortschritt(k) : 0;
    return el(
      'li',
      {},
      navLink(
        `#/kapitel/${k.id}`,
        [
          el('span', { class: 'nav-nr', 'aria-hidden': 'true' }, fertig ? '✓' : frei ? String(k.nummer) : '🔒'),
          el(
            'span',
            { class: 'nav-text' },
            `${k.icon} ${k.titel}`,
            prozent > 0 ? el('span', { class: 'nav-mini-balken' }, el('span', { style: `width:${prozent}%` })) : null,
            el('span', { class: 'nur-sr' }, fertig ? '(abgeschlossen)' : frei ? '' : '(gesperrt)'),
          ),
        ],
        `${fertig ? 'fertig' : ''} ${frei ? '' : 'gesperrt'}`,
      ),
    );
  });
  nav.replaceChildren(
    el('div', { class: 'nav-titel' }, 'Kapitel'),
    el('ol', { class: 'nav-liste' }, kapitelListe),
    el('div', { class: 'nav-titel' }, 'Werkzeuge'),
    el(
      'ul',
      { class: 'nav-liste' },
      el('li', {}, navLink('#/', [el('span', { class: 'nav-nr' }, '🏠'), el('span', { class: 'nav-text' }, 'Startseite')])),
      el('li', {}, navLink('#/handbuch', [el('span', { class: 'nav-nr' }, '📘'), el('span', { class: 'nav-text' }, 'API-Handbuch')])),
      el('li', {}, navLink('#/glossar', [el('span', { class: 'nav-nr' }, '📖'), el('span', { class: 'nav-text' }, 'Glossar')])),
      el('li', {}, navLink('#/zertifikat', [el('span', { class: 'nav-nr' }, '🏆'), el('span', { class: 'nav-text' }, 'Zertifikat')])),
    ),
  );
}

function schliesseMenue() {
  nav.classList.remove('offen');
  menueKnopf.setAttribute('aria-expanded', 'false');
}

menueKnopf.addEventListener('click', () => {
  const offen = nav.classList.toggle('offen');
  menueKnopf.setAttribute('aria-expanded', String(offen));
});

// ---------- Kopfzeile ----------

function zeichneKopf() {
  const xp = store.daten.xp;
  const rang = store.rang();
  const naechster = store.naechsterRang();
  const anteil = naechster ? Math.round(((xp - rang.ab) / (naechster.ab - rang.ab)) * 100) : 100;
  kopfStatus.replaceChildren(
    el(
      'span',
      { class: `verbindung${server.verbunden ? ' an' : ''}`, title: server.verbunden ? 'Live-Verbindung zum Server steht' : 'Keine Live-Verbindung' },
      el('span', { class: 'verbindung-text' }, server.verbunden ? 'Live' : 'Offline'),
    ),
    el('span', { class: 'rang', title: `Rang: ${rang.titel}` }, `${rang.icon} `, el('span', { class: 'rang-titel' }, rang.titel)),
    el(
      'div',
      { class: 'xp-anzeige' },
      el('div', { class: 'xp-zahl' }, el('strong', {}, `${xp} XP`), el('span', {}, naechster ? `nächster Rang: ${naechster.ab}` : 'Maximum!')),
      el(
        'div',
        { class: 'xp-balken', role: 'progressbar', 'aria-label': 'Fortschritt bis zum nächsten Rang', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': anteil },
        el('div', { style: `width:${anteil}%` }),
      ),
    ),
  );
}

// ---------- Glossar-Tooltips ----------

const tooltip = document.getElementById('tooltip');

function zeigeTooltip(ziel) {
  const eintrag = GLOSSAR_MAP[ziel.dataset.g];
  if (!eintrag) return;
  tooltip.innerHTML = `<strong>${esc(eintrag.begriff)}</strong>${esc(eintrag.kurz)}`;
  tooltip.hidden = false;
  const r = ziel.getBoundingClientRect();
  const t = tooltip.getBoundingClientRect();
  let oben = r.bottom + 8;
  if (oben + t.height > innerHeight - 8) oben = r.top - t.height - 8;
  const links = Math.min(Math.max(8, r.left + r.width / 2 - t.width / 2), innerWidth - t.width - 8);
  tooltip.style.top = `${oben}px`;
  tooltip.style.left = `${links}px`;
}

const versteckeTooltip = () => (tooltip.hidden = true);
document.addEventListener('mouseover', (e) => e.target.closest?.('.g') && zeigeTooltip(e.target.closest('.g')));
document.addEventListener('mouseout', (e) => e.target.closest?.('.g') && versteckeTooltip());
document.addEventListener('focusin', (e) => (e.target.closest?.('.g') ? zeigeTooltip(e.target.closest('.g')) : versteckeTooltip()));
document.addEventListener('scroll', versteckeTooltip, { passive: true });

// ---------- Live-Ticker: Was ist beim Server angekommen? ----------

const ticker = document.getElementById('ticker');
let tickerTimer;

function zeigeTicker(d) {
  if (d.quelle === 'spielseite' || d.quelle === 'werkstatt') return;
  const eintrag = el('button', {
    type: 'button',
    class: 'ticker-eintrag',
    title: 'Im Server-Protokoll der Werkstatt ansehen',
    html: `📡 Server empfing: ${m(d.methode)} <code>${esc(d.pfad)}</code> <span class="status-pille status-${String(d.status)[0]}">${d.status}</span> <small>${quelleText(d.quelle)}</small>`,
  });
  eintrag.addEventListener('click', () => {
    werkstatt.oeffnen();
    document.querySelector('[data-ansicht="protokoll"]')?.click();
  });
  ticker.replaceChildren(eintrag);
  clearTimeout(tickerTimer);
  tickerTimer = setTimeout(() => ticker.replaceChildren(), 7000);
}

// ---------- Start ----------

store.abonnieren((typ, d) => {
  if (['aufgabe', 'name', 'reset', 'verbindung'].includes(typ)) zeichneKopf();
  if (['aufgabe', 'schritt', 'freischaltung', 'reset'].includes(typ)) zeichneNavigation();
  if (typ === 'freischaltung' && location.hash.startsWith('#/kapitel/')) route();
  if (typ === 'anfrage') zeigeTicker(d);
});

window.addEventListener('hashchange', () => {
  if (location.hash && !location.hash.startsWith('#/')) return; // z. B. Sprunglinks
  route();
});

aktiviereKopierknoepfe();
werkstatt.init();
installiereSpiel(kontext);
begruessung();
verbindeLive();
zeichneKopf();
route();
