// Die Anfrage-Werkstatt: ein kleiner Request-Baukasten (ähnlich wie Postman), immer griffbereit.
import { code, el, esc, formatiereBody, m } from './ui.js';
import { statusInfo } from './daten/statuscodes.js';
import { VORLAGEN } from './daten/endpunkte.js';
import { server, store } from './zustand.js';

const METHODEN = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
// Diese Header setzt der Browser selbst – eine Webseite darf sie nicht verändern.
const VERBOTEN = new Set([
  'accept-charset', 'accept-encoding', 'access-control-request-headers', 'access-control-request-method', 'connection',
  'content-length', 'cookie', 'cookie2', 'date', 'dnt', 'expect', 'host', 'keep-alive', 'origin', 'referer', 'te',
  'trailer', 'transfer-encoding', 'upgrade', 'via',
]);
const istVerboten = (name) => {
  const n = name.trim().toLowerCase();
  return VERBOTEN.has(n) || n.startsWith('sec-') || n.startsWith('proxy-');
};

const QUELLEN = {
  konsole: '💻 Konsole',
  werkstatt: '🧰 Werkstatt',
  spielseite: '🎮 Spielseite',
  adressleiste: '🔗 Adressleiste',
  werkzeug: '🛠️ externes Werkzeug',
};
export const quelleText = (q) => QUELLEN[q] ?? q;

const z = {
  methode: 'GET',
  url: '/api/hallo',
  header: [{ an: true, name: 'Accept', wert: 'application/json' }],
  body: '',
  reiter: 'header',
  antwortReiter: 'body',
  ansicht: 'anfrage',
  antwort: null,
  sendet: false,
};

let panel;
let knopf;

function vorlageAus() {
  return {
    methode: z.methode,
    url: z.url,
    header: z.header.filter((h) => h.an && h.name.trim()).map((h) => [h.name, h.wert]),
    body: z.body,
  };
}

function ladeVorlage(v) {
  z.methode = v.methode ?? 'GET';
  z.url = v.url ?? '';
  z.header = (v.header ?? []).map(([name, wert]) => ({ an: true, name, wert }));
  z.body = v.body ?? '';
  z.reiter = z.body ? 'body' : 'header';
  z.antwort = null;
  z.ansicht = 'anfrage';
}

// ---------- Code-Erzeugung ----------

function aktiveHeader() {
  return z.header.filter((h) => h.an && h.name.trim()).map((h) => [h.name.trim(), h.wert]);
}

export function alsFetch({ methode, url, header, body }) {
  const ein = '    ';
  const teile = [];
  if (methode !== 'GET') teile.push(`${ein}method: "${methode}"`);
  if (header.length) {
    const zeilen = header.map(([n, w]) => `${ein}  ${JSON.stringify(n)}: ${JSON.stringify(w)}`).join(',\n');
    teile.push(`${ein}headers: {\n${zeilen}\n${ein}}`);
  }
  if (body && !['GET', 'HEAD'].includes(methode)) {
    let bodyCode;
    try {
      bodyCode = `JSON.stringify(${JSON.stringify(JSON.parse(body), null, 2).replace(/\n/g, `\n${ein}`)})`;
    } catch {
      bodyCode = `\`${body.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\``;
    }
    teile.push(`${ein}body: ${bodyCode}`);
  }
  const aufruf = teile.length ? `fetch(${JSON.stringify(url)}, {\n${teile.join(',\n')}\n  })` : `fetch(${JSON.stringify(url)})`;
  return `// In die Konsole einfügen und Enter drücken.
// Die { geschweiften Klammern } sorgen dafür, dass du den Code mehrmals ausführen kannst.
{
  const antwort = await ${aufruf};
  console.log(antwort.status, antwort.statusText);
  console.log(await antwort.text());
}`;
}

function alsCurl({ methode, url, header, body }) {
  const absolut = new URL(url, location.origin).href;
  const zeilen = [`curl -i -X ${methode} "${absolut}"`];
  for (const [n, w] of header) zeilen.push(`  -H "${n}: ${String(w).replace(/"/g, '\\"')}"`);
  if (server.spielerId) zeilen.push(`  -H "X-Spieler-ID: ${server.spielerId}"`);
  if (body && !['GET', 'HEAD'].includes(methode)) {
    let kompakt = body;
    try {
      kompakt = JSON.stringify(JSON.parse(body));
    } catch {
      /* kein JSON – unverändert */
    }
    zeilen.push(`  --data '${kompakt.replace(/'/g, "'\\''")}'`);
  }
  return zeilen.join(' \\\n');
}

// ---------- Darstellung ----------

function baueGeruest() {
  panel.innerHTML = `
    <div class="ws-kopf">
      <h2>🧰 Anfrage-Werkstatt</h2>
      <button type="button" class="ws-zu" aria-label="Werkstatt schließen">✕</button>
    </div>
    <div class="ws-ansichten" role="tablist">
      <button type="button" data-ansicht="anfrage" role="tab">Anfrage</button>
      <button type="button" data-ansicht="verlauf" role="tab">Verlauf</button>
      <button type="button" data-ansicht="protokoll" role="tab">Server-Protokoll</button>
    </div>
    <div class="ws-koerper"></div>`;
  panel.querySelector('.ws-zu').addEventListener('click', () => werkstatt.schliessen());
  panel.querySelectorAll('[data-ansicht]').forEach((b) =>
    b.addEventListener('click', () => {
      z.ansicht = b.dataset.ansicht;
      zeichne();
    }),
  );
}

function zeichne() {
  panel.querySelectorAll('[data-ansicht]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.ansicht === z.ansicht)));
  const koerper = panel.querySelector('.ws-koerper');
  koerper.innerHTML = '';
  if (z.ansicht === 'verlauf') return koerper.append(zeichneVerlauf());
  if (z.ansicht === 'protokoll') return koerper.append(zeichneProtokoll());
  koerper.append(zeichneAnfrage(), el('div', { class: 'ws-antwort', 'aria-live': 'polite' }));
  zeichneAntwort();
}

function zeichneAnfrage() {
  const auswahl = el('select', { class: 'ws-vorlage', 'aria-label': 'Vorlage laden' }, el('option', { value: '' }, '📚 Vorlage laden …'));
  VORLAGEN.forEach((gruppe, gi) => {
    const og = el('optgroup', { label: gruppe.titel });
    gruppe.vorlagen.forEach((v, vi) => og.append(el('option', { value: `${gi}:${vi}` }, `${v.methode}  ${v.name}`)));
    auswahl.append(og);
  });
  auswahl.addEventListener('change', () => {
    if (!auswahl.value) return;
    const [gi, vi] = auswahl.value.split(':').map(Number);
    ladeVorlage(VORLAGEN[gi].vorlagen[vi]);
    zeichne();
  });

  const methode = el('select', { class: `ws-methode methode-${z.methode.toLowerCase()}`, 'aria-label': 'HTTP-Methode' });
  METHODEN.forEach((x) => methode.append(el('option', { value: x, selected: x === z.methode }, x)));
  methode.addEventListener('change', () => {
    z.methode = methode.value;
    methode.className = `ws-methode methode-${z.methode.toLowerCase()}`;
  });

  const url = el('input', { class: 'ws-url', value: z.url, 'aria-label': 'Adresse (URL)', spellcheck: 'false', autocomplete: 'off', placeholder: '/api/hallo' });
  url.addEventListener('input', () => (z.url = url.value));
  url.addEventListener('keydown', (e) => e.key === 'Enter' && senden());

  const senden_ = el('button', { type: 'button', class: 'knopf knopf-primaer ws-senden', onclick: senden, disabled: z.sendet }, z.sendet ? 'Sendet …' : 'Senden ➤');

  const reiter = el('div', { class: 'ws-reiter', role: 'tablist' });
  const anzahl = z.header.filter((h) => h.an && h.name).length;
  [
    ['header', `Header (${anzahl})`],
    ['body', `Body${z.body ? ' ●' : ''}`],
  ].forEach(([id, text]) =>
    reiter.append(
      el('button', {
        type: 'button',
        role: 'tab',
        'aria-selected': String(z.reiter === id),
        onclick: () => {
          z.reiter = id;
          zeichne();
        },
      }, text),
    ),
  );

  const inhalt = z.reiter === 'header' ? zeichneHeader() : zeichneBody();

  return el(
    'div',
    { class: 'ws-anfrage' },
    auswahl,
    el('div', { class: 'ws-zeile' }, methode, url, senden_),
    reiter,
    inhalt,
  );
}

function zeichneHeader() {
  const liste = el('div', { class: 'ws-header-liste' });
  z.header.forEach((h, i) => {
    const an = el('input', { type: 'checkbox', checked: h.an, 'aria-label': 'Header aktiv' });
    an.addEventListener('change', () => (h.an = an.checked));
    const name = el('input', { value: h.name, placeholder: 'Name, z. B. Content-Type', 'aria-label': 'Header-Name', spellcheck: 'false' });
    name.addEventListener('input', () => {
      h.name = name.value;
      warnung.textContent = istVerboten(h.name) ? '⚠️ Diesen Header setzt der Browser selbst – er wird ignoriert.' : '';
    });
    const wert = el('input', { value: h.wert, placeholder: 'Wert', 'aria-label': 'Header-Wert', spellcheck: 'false' });
    wert.addEventListener('input', () => (h.wert = wert.value));
    const weg = el('button', {
      type: 'button',
      class: 'ws-weg',
      'aria-label': 'Header entfernen',
      onclick: () => {
        z.header.splice(i, 1);
        zeichne();
      },
    }, '✕');
    const warnung = el('div', { class: 'ws-warnung' }, istVerboten(h.name) ? '⚠️ Diesen Header setzt der Browser selbst – er wird ignoriert.' : '');
    liste.append(el('div', { class: 'ws-header-zeile' }, an, name, wert, weg), warnung);
  });
  return el(
    'div',
    { class: 'ws-bereich' },
    liste,
    el('button', {
      type: 'button',
      class: 'knopf knopf-klein',
      onclick: () => {
        z.header.push({ an: true, name: '', wert: '' });
        zeichne();
        [...panel.querySelectorAll('.ws-header-zeile')].at(-1)?.querySelectorAll('input')[1]?.focus();
      },
    }, '+ Header hinzufügen'),
    el('p', { class: 'ws-hinweis' }, 'Automatisch dabei (nur bei Anfragen an dieses Spiel): ', el('code', {}, 'X-Quelle: werkstatt'), ' – daran erkennt der Server, dass die Anfrage aus der Werkstatt kommt.'),
  );
}

function zeichneBody() {
  const feld = el('textarea', {
    class: 'ws-body',
    spellcheck: 'false',
    'aria-label': 'Body der Anfrage',
    placeholder: '{\n  "titel": "Hallo"\n}',
    rows: 10,
  });
  feld.value = z.body;
  const status = el('div', { class: 'ws-body-status' });
  const pruefe = () => {
    z.body = feld.value;
    if (!feld.value.trim()) return (status.textContent = '');
    if (/^\s*</.test(feld.value)) return (status.textContent = '📄 sieht aus wie XML');
    try {
      JSON.parse(feld.value);
      status.innerHTML = '<span class="ok">✅ gültiges JSON</span>';
    } catch (e) {
      status.innerHTML = `<span class="fehlerhaft">❌ kein gültiges JSON</span> <small>${esc(e.message)}</small>`;
    }
  };
  feld.addEventListener('input', pruefe);
  feld.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) senden();
    if (e.key === 'Tab') {
      e.preventDefault();
      feld.setRangeText('  ', feld.selectionStart, feld.selectionEnd, 'end');
      z.body = feld.value;
    }
  });
  pruefe();
  return el(
    'div',
    { class: 'ws-bereich' },
    feld,
    el(
      'div',
      { class: 'ws-body-leiste' },
      status,
      el('button', {
        type: 'button',
        class: 'knopf knopf-klein',
        onclick: () => {
          try {
            feld.value = JSON.stringify(JSON.parse(feld.value), null, 2);
            pruefe();
          } catch {
            status.innerHTML = '<span class="fehlerhaft">❌ Erst muss das JSON gültig sein.</span>';
          }
        },
      }, 'JSON formatieren'),
    ),
    ['GET', 'HEAD'].includes(z.methode) && z.body
      ? el('p', { class: 'ws-warnung' }, `⚠️ ${z.methode}-Anfragen haben keinen Body. Wähle z. B. POST.`)
      : null,
    el('p', { class: 'ws-hinweis' }, 'Tipp: Strg + Enter schickt die Anfrage ab.'),
  );
}

function zeichneAntwort() {
  const ziel = panel.querySelector('.ws-antwort');
  if (!ziel) return;
  ziel.innerHTML = '';
  const a = z.antwort;
  if (z.sendet) return ziel.append(el('p', { class: 'ws-leer' }, '📨 Anfrage ist unterwegs …'));
  if (!a) return ziel.append(el('p', { class: 'ws-leer' }, 'Noch keine Antwort. Bau eine Anfrage und klicke auf „Senden“.'));

  const hinweise = a.hinweise?.length ? el('ul', { class: 'ws-hinweise' }, a.hinweise.map((h) => el('li', {}, h))) : null;

  if (a.netzwerkFehler) {
    ziel.append(
      el('div', { class: 'ws-status-zeile' }, el('span', { class: 'status-pille status-x' }, 'Keine Antwort')),
      hinweise ?? '',
      el('div', {
        class: 'box box-achtung',
        html: `<div class="box-titel">Die Anfrage ist gar nicht beim Server angekommen</div>
          <p>Mögliche Gründe: Die Adresse ist falsch geschrieben, der Server ist nicht erreichbar, oder eine fremde Domain erlaubt keine Anfragen von dieser Seite (<strong>CORS</strong>). Schau in die Konsole der DevTools – dort steht meist eine rote Fehlermeldung.</p>
          <p><small>Technische Meldung: ${esc(a.netzwerkFehler)}</small></p>`,
      }),
    );
    return;
  }

  const info = statusInfo(a.status);
  ziel.append(
    el(
      'div',
      { class: 'ws-status-zeile' },
      el('span', { class: `status-pille status-${String(a.status)[0]}`, title: info.erklaerung }, `${a.status} ${info.name}`),
      el('span', { class: 'ws-status-text' }, `${info.klasse.emoji} ${info.kurz}`),
      el('span', { class: 'ws-meta' }, `⏱ ${a.dauer} ms · 📦 ${a.groesse} Bytes`),
    ),
    info.erklaerung ? el('p', { class: 'ws-erklaerung' }, info.erklaerung) : '',
    a.umgeleitet ? el('p', { class: 'ws-hinweis' }, `↪️ Der Browser wurde umgeleitet und hat automatisch ${new URL(a.endUrl).pathname} abgefragt. Im Netzwerk-Tab siehst du beide Anfragen.`) : '',
    hinweise ?? '',
  );

  const reiter = el('div', { class: 'ws-reiter', role: 'tablist' });
  [
    ['body', 'Body'],
    ['header', `Header (${a.header.length})`],
    ['code', 'Als Code'],
  ].forEach(([id, text]) =>
    reiter.append(
      el('button', {
        type: 'button',
        role: 'tab',
        'aria-selected': String(z.antwortReiter === id),
        onclick: () => {
          z.antwortReiter = id;
          zeichneAntwort();
        },
      }, text),
    ),
  );
  ziel.append(reiter);

  if (z.antwortReiter === 'body') {
    if (!a.text) {
      ziel.append(el('p', { class: 'ws-leer' }, '(leer – diese Antwort hat keinen Body)'));
    } else {
      const f = formatiereBody(a.text, a.typ);
      ziel.append(el('pre', { class: 'ws-pre', html: `<code>${f.html}</code>` }));
    }
  } else if (z.antwortReiter === 'header') {
    ziel.append(
      el('table', { class: 'tabelle ws-tabelle' },
        el('tbody', {}, a.header.map(([n, w]) => el('tr', {}, el('th', {}, n), el('td', {}, w)))),
      ),
    );
  } else {
    const v = a.anfrage;
    ziel.append(
      el('div', { html: `<p class="ws-hinweis">Dieselbe Anfrage als JavaScript für die <strong>Konsole</strong>:</p>${code('js', alsFetch(v))}` }),
      el('div', {
        html: `<p class="ws-hinweis">… und als <strong>curl</strong>-Befehl fürs Terminal (Windows: <code>curl.exe</code> in PowerShell oder Git Bash):</p>${code('bash', alsCurl(v))}`,
      }),
    );
  }
}

function zeichneVerlauf() {
  const liste = store.daten.verlauf;
  if (!liste.length) return el('p', { class: 'ws-leer' }, 'Hier erscheinen deine letzten Anfragen aus der Werkstatt.');
  return el(
    'ul',
    { class: 'ws-liste' },
    liste.map((e) =>
      el(
        'li',
        {},
        el('button', {
          type: 'button',
          onclick: () => {
            ladeVorlage(e.vorlage);
            zeichne();
          },
          html: `${m(e.methode)} <span class="ws-liste-pfad">${esc(e.url)}</span> <span class="status-pille status-${String(e.status)[0] || 'x'}">${e.status || '–'}</span>`,
        }),
      ),
    ),
  );
}

function zeichneProtokoll() {
  const kopf = el('p', { class: 'ws-hinweis' }, 'Alles, was beim Server von dir angekommen ist – egal ob aus Konsole, Werkstatt, Adressleiste oder curl. Live!');
  if (!server.protokoll.length) return el('div', {}, kopf, el('p', { class: 'ws-leer' }, 'Noch nichts angekommen. Schick eine Anfrage!'));
  return el(
    'div',
    {},
    kopf,
    el(
      'ul',
      { class: 'ws-liste ws-protokoll' },
      server.protokoll.map((e) =>
        el('li', {
          html: `<span class="ws-zeit">${new Date(e.zeit).toLocaleTimeString('de-DE')}</span> ${m(e.methode)} <span class="ws-liste-pfad">${esc(e.pfad)}</span> <span class="status-pille status-${String(e.status)[0]}">${e.status}</span> <span class="ws-quelle">${quelleText(e.quelle)}</span>`,
        }),
      ),
    ),
  );
}

// ---------- Senden ----------

async function senden() {
  if (z.sendet) return;
  const url = z.url.trim();
  if (!url) {
    z.antwort = { netzwerkFehler: 'Keine Adresse angegeben.', hinweise: ['Bitte gib eine Adresse ein, z. B. /api/hallo'] };
    return zeichneAntwort();
  }
  const hinweise = [];
  const headers = new Headers();
  const ignoriert = [];
  try {
    for (const [name, wert] of aktiveHeader()) {
      if (istVerboten(name)) ignoriert.push(name);
      else headers.append(name, wert);
    }
  } catch (e) {
    z.antwort = { netzwerkFehler: e.message, hinweise: ['Ein Header ist ungültig. Header-Namen dürfen keine Leerzeichen, Umlaute oder Doppelpunkte enthalten.'] };
    return zeichneAntwort();
  }
  let ziel;
  try {
    ziel = new URL(url, location.href);
  } catch {
    z.antwort = { netzwerkFehler: 'Ungültige Adresse.', hinweise: ['Die Adresse ist so nicht gültig. Beispiel: /api/hallo'] };
    return zeichneAntwort();
  }
  // Nur an den eigenen Server – fremde APIs würden den unbekannten Header per CORS ablehnen.
  if (ziel.origin === location.origin) headers.set('X-Quelle', 'werkstatt');
  if (ignoriert.length) hinweise.push(`Diese Header darf eine Webseite nicht selbst setzen, der Browser hat sie ignoriert: ${ignoriert.join(', ')}`);

  const ohneBody = ['GET', 'HEAD'].includes(z.methode);
  const init = { method: z.methode, headers };
  if (!ohneBody && z.body !== '') {
    init.body = z.body;
    if (!headers.has('content-type')) hinweise.push('Du schickst einen Body ohne „Content-Type“-Header. Der Browser setzt dann automatisch „text/plain“ – viele APIs lehnen das ab.');
  }
  if (ohneBody && z.body.trim()) hinweise.push(`${z.methode}-Anfragen haben keinen Body – er wurde nicht mitgeschickt.`);

  const anfrage = vorlageAus();
  z.sendet = true;
  zeichne();
  const start = performance.now();
  try {
    const res = await fetch(url, init);
    const text = await res.text();
    z.antwort = {
      status: res.status,
      header: [...res.headers],
      text,
      typ: res.headers.get('content-type') ?? '',
      dauer: Math.round(performance.now() - start),
      groesse: new TextEncoder().encode(text).length,
      umgeleitet: res.redirected,
      endUrl: res.url,
      hinweise,
      anfrage,
    };
    store.merkeVerlauf({ zeit: new Date().toISOString(), methode: z.methode, url, status: res.status, vorlage: anfrage });
  } catch (e) {
    z.antwort = { netzwerkFehler: e.message, hinweise, anfrage };
    store.merkeVerlauf({ zeit: new Date().toISOString(), methode: z.methode, url, status: '', vorlage: anfrage });
  }
  z.sendet = false;
  z.antwortReiter = 'body';
  zeichne();
}

// ---------- Öffentliche Schnittstelle ----------

export const werkstatt = {
  init() {
    panel = document.getElementById('werkstatt');
    knopf = document.getElementById('werkstatt-knopf');
    baueGeruest();
    knopf.addEventListener('click', () => werkstatt.umschalten());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) werkstatt.schliessen();
    });
    store.abonnieren((typ) => {
      if (typ === 'anfrage' && !panel.hidden && z.ansicht === 'protokoll') zeichne();
    });
  },
  istOffen: () => !panel.hidden,
  oeffnen(vorlage) {
    if (vorlage) ladeVorlage(vorlage);
    panel.hidden = false;
    document.body.classList.add('werkstatt-offen');
    knopf.setAttribute('aria-expanded', 'true');
    zeichne();
    panel.querySelector(z.body ? '.ws-senden' : '.ws-url')?.focus({ preventScroll: true });
  },
  schliessen() {
    panel.hidden = true;
    document.body.classList.remove('werkstatt-offen');
    knopf.setAttribute('aria-expanded', 'false');
    knopf.focus({ preventScroll: true });
  },
  umschalten() {
    if (panel.hidden) werkstatt.oeffnen();
    else werkstatt.schliessen();
  },
};
