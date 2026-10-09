import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hex, leseCookies } from './hilfen.js';
import { ID_MUSTER } from './spieler.js';

const OEFFENTLICH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

// connect-src * erlaubt es, aus der Konsole auch echte öffentliche APIs anzufragen.
const SICHERHEIT = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src *; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
};

function nichtGefunden(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', ...SICHERHEIT });
  res.end('<!doctype html><meta charset="utf-8"><title>404</title><p>Seite nicht gefunden. <a href="/">Zur Startseite</a></p>');
}

export async function statischeDatei(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Methode nicht erlaubt');
  }
  let relativ;
  try {
    relativ = decodeURIComponent(url.pathname);
  } catch {
    return nichtGefunden(res);
  }
  if (relativ.endsWith('/')) relativ += 'index.html';
  const datei = path.resolve(OEFFENTLICH, `.${relativ}`);
  if (datei !== OEFFENTLICH && !datei.startsWith(OEFFENTLICH + path.sep)) return nichtGefunden(res);

  let info;
  try {
    info = await stat(datei);
  } catch {
    return nichtGefunden(res);
  }
  if (!info.isFile()) return nichtGefunden(res);

  const kopf = {
    'Content-Type': MIME[path.extname(datei).toLowerCase()] ?? 'application/octet-stream',
    'Content-Length': info.size,
    'Cache-Control': 'no-cache',
    'Last-Modified': info.mtime.toUTCString(),
    ...SICHERHEIT,
  };
  // Die Spieler-ID schon mit der Seite vergeben – sonst könnten die ersten parallelen
  // API-Anfragen (Live-Verbindung + Daten) jeweils einen eigenen Spieler anlegen.
  if (datei.endsWith('.html') && !ID_MUSTER.test(leseCookies(req.headers.cookie).spieler_id ?? '')) {
    kopf['Set-Cookie'] = `spieler_id=${hex(6)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax; HttpOnly`;
  }
  res.writeHead(200, kopf);
  if (req.method === 'HEAD') return res.end();
  createReadStream(datei).pipe(res);
}
