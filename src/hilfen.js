import crypto from 'node:crypto';

/** Fehler, der direkt als HTTP-Antwort an den Client geht. */
export class ApiFehler extends Error {
  constructor(status, daten, header = {}) {
    super(typeof daten === 'object' && daten?.fehler ? daten.fehler : `HTTP ${status}`);
    this.status = status;
    this.daten = daten;
    this.header = header;
  }
}

export const MAX_BODY = 64 * 1024;
const MAX_LESEN = 1024 * 1024;

/** Liest den Body einer Anfrage als Text (mit Größenlimit → 413). */
export function leseBody(req, limit = MAX_BODY) {
  return new Promise((resolve, reject) => {
    let groesse = 0;
    let zuGross = false;
    const teile = [];
    req.on('data', (stueck) => {
      groesse += stueck.length;
      if (groesse > limit) {
        zuGross = true;
        if (groesse > MAX_LESEN) req.destroy();
        return;
      }
      teile.push(stueck);
    });
    req.on('end', () => {
      if (zuGross) {
        reject(
          new ApiFehler(
            413,
            {
              fehler: 'Body zu groß',
              nachricht: `Der Body ist größer als ${limit / 1024} KB. So viele Daten nimmt diese Übungs-API nicht an.`,
            },
            { Connection: 'close' },
          ),
        );
      } else {
        resolve(Buffer.concat(teile).toString('utf8'));
      }
    });
    req.on('error', reject);
  });
}

export function leseCookies(kopf = '') {
  const cookies = {};
  for (const teil of kopf.split(';')) {
    const t = teil.trim();
    if (!t) continue;
    const i = t.indexOf('=');
    const name = i < 0 ? t : t.slice(0, i);
    let wert = i < 0 ? '' : t.slice(i + 1);
    try {
      wert = decodeURIComponent(wert);
    } catch {
      /* Wert unverändert lassen */
    }
    cookies[name] = wert;
  }
  return cookies;
}

/** Text für Vergleiche vereinheitlichen: klein, ohne Umlaute, ohne Anführungszeichen. */
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

/** Wandelt Eingaben wie "148,90 €" oder "1.234,50" in eine Zahl um. */
export function alsZahl(s) {
  let t = String(s ?? '')
    .replace(/€|euro|eur/gi, '')
    .replace(/\s/g, '');
  if (t.includes(',') && t.includes('.')) t = t.replace(/\./g, '').replace(',', '.');
  else t = t.replace(',', '.');
  if (t === '') return NaN;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}

export function zahlGleich(eingabe, erwartet) {
  const n = alsZahl(eingabe);
  return Number.isFinite(n) && Math.abs(n - erwartet) < 0.001;
}

export const zufall = (min, max) => crypto.randomInt(min, max + 1);
export const hex = (bytes) => crypto.randomBytes(bytes).toString('hex');
export const waehle = (liste) => liste[crypto.randomInt(liste.length)];

export function escXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function entXml(s) {
  return String(s ?? '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

export function istObjekt(x) {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

export function geld(betrag) {
  return Math.round(betrag * 100) / 100;
}
