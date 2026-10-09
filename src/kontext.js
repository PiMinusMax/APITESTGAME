import { ApiFehler, hex, istObjekt, leseBody, leseCookies } from './hilfen.js';
import { erzeugeSpieler, holeSpieler, ID_MUSTER } from './spieler.js';
import { pruefeJwt } from './jwt.js';

// Endpunkte, die das Spiel selbst im Hintergrund nutzt. Sie tauchen nicht im
// Statuscode-Album und nicht im Server-Protokoll der Spielerin / des Spielers auf.
const INFRASTRUKTUR = new Set(['/api/ereignisse', '/api/fortschritt', '/api/pruefen', '/api/entwicklerportal']);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-API-Key, X-Spieler-ID, X-Quelle, SOAPAction',
  'Access-Control-Expose-Headers':
    'X-Anfrage-ID, X-Geheimer-Hinweis, Location, Retry-After, WWW-Authenticate, X-RateLimit-Limit, X-RateLimit-Remaining',
};

/**
 * Woher kommt die Anfrage? Wichtig, damit z. B. Konsolen-Aufgaben nur zählen,
 * wenn die Anfrage wirklich selbst geschrieben wurde.
 */
function bestimmeQuelle(req) {
  const markierung = String(req.headers['x-quelle'] || '').toLowerCase();
  if (markierung === 'spielseite' || markierung === 'werkstatt') return markierung;
  const modus = req.headers['sec-fetch-mode'];
  if (modus === 'navigate') return 'adressleiste';
  if (modus) return req.headers['sec-fetch-site'] === 'cross-site' ? 'werkzeug' : 'konsole';
  return 'werkzeug'; // curl, Postman & Co. senden keine Sec-Fetch-Header
}

function findeSpieler(req, cookies) {
  const kandidaten = [cookies.spieler_id, req.headers['x-spieler-id']];
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    const pruefung = pruefeJwt(auth.slice(7).trim());
    if (pruefung.payload?.sub) kandidaten.push(pruefung.payload.sub);
  }
  for (const k of kandidaten) {
    const id = String(k || '').trim().toLowerCase();
    if (!ID_MUSTER.test(id)) continue;
    // Nach einem Server-Neustart behält man so trotzdem seine ID.
    return { spieler: holeSpieler(id) ?? erzeugeSpieler(id), neu: false, ausCookie: id === cookies.spieler_id };
  }
  return { spieler: erzeugeSpieler(), neu: true, ausCookie: false };
}

export function erstelleKontext(req, res, url) {
  const cookies = leseCookies(req.headers.cookie);
  const { spieler, ausCookie } = findeSpieler(req, cookies);
  let bodyCache;

  const ctx = {
    req,
    res,
    url,
    methode: req.method.toUpperCase(),
    pfad: url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname,
    query: url.searchParams,
    params: {},
    spieler,
    quelle: bestimmeQuelle(req),
    anfrageId: `req-${hex(4)}`,
    beantwortet: false,
    neuesCookie: ausCookie
      ? null
      : `spieler_id=${spieler.id}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax; HttpOnly`,
    get selbstGeschrieben() {
      return this.quelle === 'konsole' || this.quelle === 'werkzeug';
    },
    async text() {
      if (bodyCache === undefined) bodyCache = await leseBody(req);
      return bodyCache;
    },
  };
  return ctx;
}

/** Liest einen JSON-Body und gibt verständliche Fehler (400 / 415) zurück. */
export async function leseJson(ctx, { erforderlich = true } = {}) {
  const text = await ctx.text();
  if (!text.trim()) {
    if (!erforderlich) return null;
    throw new ApiFehler(400, {
      fehler: 'Body fehlt',
      nachricht: 'Diese Anfrage braucht Daten im Body (als JSON). Der Body war leer.',
    });
  }
  const typ = String(ctx.req.headers['content-type'] || '');
  if (!typ.toLowerCase().includes('application/json')) {
    throw new ApiFehler(415, {
      fehler: 'Unbekanntes Datenformat',
      nachricht: typ
        ? `Du hast "Content-Type: ${typ}" geschickt. Dieser Endpunkt versteht aber nur JSON.`
        : 'Der Header "Content-Type" fehlt. Der Server weiß deshalb nicht, in welchem Format dein Body ist.',
      loesung: 'Füge den Header  Content-Type: application/json  hinzu.',
    });
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new ApiFehler(400, {
      fehler: 'Ungültiges JSON',
      nachricht: 'Der Body ist kein gültiges JSON. Prüfe Anführungszeichen, Kommas und Klammern.',
      technische_details: e.message,
    });
  }
}

export async function leseJsonObjekt(ctx, optionen) {
  const daten = await leseJson(ctx, optionen);
  if (daten === null && optionen?.erforderlich === false) return {};
  if (!istObjekt(daten)) {
    throw new ApiFehler(400, {
      fehler: 'Objekt erwartet',
      nachricht: 'Der Body muss ein JSON-Objekt sein, also mit { geschweiften Klammern } beginnen.',
    });
  }
  return daten;
}

export function antworte(ctx, status, daten, header = {}) {
  if (ctx.beantwortet) return;
  ctx.beantwortet = true;

  const kopf = { 'Cache-Control': 'no-store', ...CORS, 'X-Anfrage-ID': ctx.anfrageId, ...header };
  if (ctx.neuesCookie) kopf['Set-Cookie'] = ctx.neuesCookie;

  let body = '';
  if (daten !== undefined && daten !== null && status !== 204) {
    if (typeof daten === 'string') {
      body = daten;
      kopf['Content-Type'] ??= 'text/plain; charset=utf-8';
    } else {
      body = JSON.stringify(daten, null, 2);
      kopf['Content-Type'] ??= 'application/json; charset=utf-8';
    }
  }

  ctx.res.writeHead(status, kopf);
  ctx.res.end(ctx.methode === 'HEAD' ? undefined : body);
  protokolliere(ctx, status);
}

function protokolliere(ctx, status) {
  if (INFRASTRUKTUR.has(ctx.pfad)) return;
  ctx.spieler.statuscode(status);
  const pfad = (ctx.url.pathname + ctx.url.search).slice(0, 200);
  ctx.spieler.sende('anfrage', {
    methode: ctx.methode,
    pfad,
    status,
    quelle: ctx.quelle,
    zeit: new Date().toISOString(),
  });
}

export function sseKopf(ctx) {
  const kopf = {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    ...CORS,
  };
  if (ctx.neuesCookie) kopf['Set-Cookie'] = ctx.neuesCookie;
  return kopf;
}

export function corsKopf() {
  return { ...CORS };
}
