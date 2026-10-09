// Kleine Helfer für DOM, Texte und Code-Darstellung.

export function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** el('div', { class: 'x', onclick: fn }, 'Text', kindElement) */
export function el(tag, attribute = {}, ...kinder) {
  const knoten = document.createElement(tag);
  for (const [name, wert] of Object.entries(attribute)) {
    if (wert === undefined || wert === null || wert === false) continue;
    if (name.startsWith('on') && typeof wert === 'function') knoten.addEventListener(name.slice(2), wert);
    else if (name === 'html') knoten.innerHTML = wert;
    else if (name === 'dataset') Object.assign(knoten.dataset, wert);
    else knoten.setAttribute(name, wert === true ? '' : wert);
  }
  for (const kind of kinder.flat()) {
    if (kind === null || kind === undefined || kind === false) continue;
    knoten.append(kind instanceof Node ? kind : document.createTextNode(String(kind)));
  }
  return knoten;
}

export const ursprung = () => location.origin;

// ---------- Inhalts-Bausteine (liefern HTML-Text) ----------

export const merke = (html, titel = 'Merke') =>
  `<div class="box box-merke"><div class="box-titel">💡 ${titel}</div><div>${html}</div></div>`;
export const achtung = (html, titel = 'Achtung') =>
  `<div class="box box-achtung"><div class="box-titel">⚠️ ${titel}</div><div>${html}</div></div>`;
export const job = (html, titel = 'So ist es im Job') =>
  `<div class="box box-job"><div class="box-titel">💼 ${titel}</div><div>${html}</div></div>`;
export const neugierig = (html, titel = 'Für Neugierige') =>
  `<details class="box box-info"><summary>🔍 ${titel}</summary><div>${html}</div></details>`;
export const g = (id, text) => `<span class="g" data-g="${id}" tabindex="0">${text}</span>`;
export const k = (...tasten) => tasten.map((t) => `<kbd>${t}</kbd>`).join('+');
export const m = (methode) => `<span class="methode methode-${methode.toLowerCase()}">${methode}</span>`;
export const c = (text) => `<code>${esc(text)}</code>`;

export function tabelle(kopf, zeilen, klasse = '') {
  return `<div class="tabelle-rahmen"><table class="tabelle ${klasse}"><thead><tr>${kopf
    .map((x) => `<th>${x}</th>`)
    .join('')}</tr></thead><tbody>${zeilen.map((z) => `<tr>${z.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

const SPRACHNAMEN = { json: 'JSON', xml: 'XML', js: 'JavaScript', http: 'HTTP', bash: 'Terminal', text: 'Text', graphql: 'GraphQL', yaml: 'YAML', csv: 'CSV' };

/** Codeblock mit Hervorhebung und Kopieren-Knopf (als HTML-Text). */
export function code(sprache, text, { titel, kopieren = true } = {}) {
  const roh = String(text).replace(/^\n/, '').replace(/\s+$/, '');
  return `<div class="code-block" data-sprache="${sprache}">
<div class="code-kopf"><span>${esc(titel ?? SPRACHNAMEN[sprache] ?? sprache)}</span>${
    kopieren ? '<button type="button" class="kopieren" aria-label="Code kopieren">📋 Kopieren</button>' : ''
  }</div><pre><code>${hervorheben(roh, sprache)}</code></pre></div>`;
}

// ---------- Syntax-Hervorhebung ----------

const span = (klasse, html) => `<span class="t-${klasse}">${html}</span>`;

function markiere(text, regex, fn) {
  let aus = '';
  let letzte = 0;
  for (const treffer of text.matchAll(regex)) {
    aus += esc(text.slice(letzte, treffer.index)) + fn(treffer);
    letzte = treffer.index + treffer[0].length;
  }
  return aus + esc(text.slice(letzte));
}

function hlJson(t) {
  return markiere(t, /("(?:\\.|[^"\\\n])*")(\s*:)?|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, (x) => {
    if (x[1]) return x[2] ? span('schluessel', esc(x[1])) + esc(x[2]) : span('text', esc(x[1]));
    if (x[3]) return span('literal', x[3]);
    return span('zahl', esc(x[0]));
  });
}

function hlTag(tag) {
  if (tag.startsWith('<!--') || tag.startsWith('<?')) return span('kommentar', esc(tag));
  const t = tag.match(/^(<\/?)([\w:.-]+)([\s\S]*?)(\/?>)$/);
  if (!t) return esc(tag);
  const attr = markiere(t[3], /([\w:.-]+)(\s*=\s*)("[^"]*"|'[^']*')/g, (a) => span('attr', esc(a[1])) + esc(a[2]) + span('text', esc(a[3])));
  return span('tag', esc(t[1] + t[2])) + attr + span('tag', esc(t[4]));
}

function hlXml(t) {
  return markiere(t, /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<\/?[\w:.-]+(?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*\s*\/?>/g, (x) => hlTag(x[0]));
}

function hlJs(t) {
  return markiere(
    t,
    /(\/\/[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\b(const|let|var|await|async|function|return|new|if|else|for|of|true|false|null|undefined|then)\b|\b(\d+(?:\.\d+)?)\b|\b(fetch|console|JSON|spiel)\b/g,
    (x) => {
      if (x[1]) return span('kommentar', esc(x[1]));
      if (x[2]) return span('text', esc(x[2]));
      if (x[3]) return span('literal', x[3]);
      if (x[4]) return span('zahl', x[4]);
      return span('funktion', x[5]);
    },
  );
}

function hlGraphql(t) {
  return markiere(t, /(#[^\n]*)|("(?:\\.|[^"\\])*")|\b(query|mutation)\b|(\$\w+)|\b(\d+)\b|(\w+)(?=\s*\()/g, (x) => {
    if (x[1]) return span('kommentar', esc(x[1]));
    if (x[2]) return span('text', esc(x[2]));
    if (x[3]) return span('literal', x[3]);
    if (x[4]) return span('attr', esc(x[4]));
    if (x[5]) return span('zahl', x[5]);
    return span('funktion', esc(x[6]));
  });
}

function hlHttp(t) {
  const [kopf, ...rest] = t.split(/\n\s*\n/);
  const zeilen = kopf.split('\n').map((zeile, i) => {
    if (i === 0) {
      const anfrage = zeile.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)(\s.*)$/);
      if (anfrage) return span('methode', anfrage[1]) + esc(anfrage[2]).replace(/HTTP\/[\d.]+/, (p) => span('kommentar', p));
      const antwort = zeile.match(/^(HTTP\/[\d.]+)(\s+)(\d{3})(.*)$/);
      if (antwort) return span('kommentar', antwort[1]) + antwort[2] + span(`status${antwort[3][0]}`, antwort[3]) + esc(antwort[4]);
      return esc(zeile);
    }
    const doppelpunkt = zeile.indexOf(':');
    if (doppelpunkt < 0) return esc(zeile);
    return span('schluessel', esc(zeile.slice(0, doppelpunkt))) + esc(zeile.slice(doppelpunkt));
  });
  if (!rest.length) return zeilen.join('\n');
  const koerper = rest.join('\n\n');
  const hl = /^\s*[{[]/.test(koerper) ? hlJson(koerper) : /^\s*</.test(koerper) ? hlXml(koerper) : esc(koerper);
  return `${zeilen.join('\n')}\n\n${hl}`;
}

function hlBash(t) {
  return markiere(t, /("(?:\\.|[^"\\])*"|'[^']*')|(\s--?[\w-]+)|^(curl(?:\.exe)?)\b/gm, (x) => {
    if (x[1]) return span('text', esc(x[1]));
    if (x[2]) return span('attr', esc(x[2]));
    return span('funktion', x[3]);
  });
}

function hlYaml(t) {
  return markiere(t, /(#[^\n]*)|^(\s*-?\s*)([\w$/{}.-]+)(:)|("[^"]*"|'[^']*')/gm, (x) => {
    if (x[1]) return span('kommentar', esc(x[1]));
    if (x[3]) return esc(x[2]) + span('schluessel', esc(x[3])) + esc(x[4]);
    return span('text', esc(x[5]));
  });
}

export function hervorheben(text, sprache) {
  switch (sprache) {
    case 'json':
      return hlJson(text);
    case 'xml':
      return hlXml(text);
    case 'js':
      return hlJs(text);
    case 'http':
      return hlHttp(text);
    case 'bash':
      return hlBash(text);
    case 'graphql':
      return hlGraphql(text);
    case 'yaml':
      return hlYaml(text);
    default:
      return esc(text);
  }
}

/** Erkennt das Format eines Antwort-Bodys und formatiert ihn hübsch. */
export function formatiereBody(text, contentType = '') {
  const typ = contentType.toLowerCase();
  if (typ.includes('json') || /^\s*[{[]/.test(text)) {
    try {
      return { html: hlJson(JSON.stringify(JSON.parse(text), null, 2)), sprache: 'json' };
    } catch {
      /* kein gültiges JSON → als Text zeigen */
    }
  }
  if (typ.includes('xml') || /^\s*<\?xml|^\s*<[\w:]+/.test(text)) return { html: hlXml(text), sprache: 'xml' };
  return { html: esc(text), sprache: 'text' };
}

// ---------- Rückmeldungen ----------

export function toast(html, art = 'info', dauer = 4500) {
  const ziel = document.getElementById('toasts');
  while (ziel.children.length >= 4) ziel.firstElementChild.remove();
  const t = el('div', { class: `toast toast-${art}`, html });
  ziel.append(t);
  requestAnimationFrame(() => t.classList.add('sichtbar'));
  setTimeout(() => {
    t.classList.remove('sichtbar');
    setTimeout(() => t.remove(), 400);
  }, dauer);
}

export function konfetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const farben = ['#3b5bdb', '#f08c00', '#2b8a3e', '#e64980', '#7048e8', '#fab005'];
  const behaelter = el('div', { class: 'konfetti', 'aria-hidden': 'true' });
  for (let i = 0; i < 80; i++) {
    const stueck = el('i');
    stueck.style.left = `${Math.random() * 100}%`;
    stueck.style.background = farben[i % farben.length];
    stueck.style.animationDelay = `${Math.random() * 0.6}s`;
    stueck.style.animationDuration = `${2 + Math.random() * 1.5}s`;
    stueck.style.transform = `rotate(${Math.random() * 360}deg)`;
    behaelter.append(stueck);
  }
  document.body.append(behaelter);
  setTimeout(() => behaelter.remove(), 4000);
}

export async function kopiereText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const feld = el('textarea', { style: 'position:fixed;opacity:0' });
    feld.value = text;
    document.body.append(feld);
    feld.select();
    const ok = document.execCommand('copy');
    feld.remove();
    return ok;
  }
}

/** Globale Klick-Behandlung für alle Kopieren-Knöpfe in Codeblöcken. */
export function aktiviereKopierknoepfe() {
  document.addEventListener('click', async (e) => {
    const knopf = e.target.closest('.kopieren');
    if (!knopf) return;
    const block = knopf.closest('.code-block');
    const text = knopf.dataset.text ?? block?.querySelector('pre')?.textContent ?? '';
    const ok = await kopiereText(text);
    const alt = knopf.textContent;
    knopf.textContent = ok ? '✅ Kopiert!' : '❌ Ging nicht';
    setTimeout(() => (knopf.textContent = alt), 1600);
  });
}

export function scrolleZu(knoten) {
  const sanft = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  knoten.scrollIntoView({ behavior: sanft ? 'smooth' : 'auto', block: 'start' });
}

export function mischen(liste) {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

export function normalisiere(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/["'„“”‚‘’`]/g, '')
    .replace(/\s+/g, ' ');
}
