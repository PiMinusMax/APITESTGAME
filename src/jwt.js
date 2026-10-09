import crypto from 'node:crypto';
import { hex } from './hilfen.js';

// Ohne festes Geheimnis werden Tokens bei jedem Neustart ungültig – für ein Lernspiel genau richtig.
const GEHEIMNIS = process.env.JWT_SECRET || hex(32);

const b64 = (objekt) => Buffer.from(JSON.stringify(objekt)).toString('base64url');
const signatur = (inhalt) => crypto.createHmac('sha256', GEHEIMNIS).update(inhalt).digest('base64url');

export function signiereJwt(payload) {
  const kopf = b64({ alg: 'HS256', typ: 'JWT' });
  const daten = b64(payload);
  return `${kopf}.${daten}.${signatur(`${kopf}.${daten}`)}`;
}

/** Prüft ein Token. Ergebnis: { ok, payload, grund } */
export function pruefeJwt(token) {
  const teile = String(token || '').split('.');
  if (teile.length !== 3) return { ok: false, grund: 'format' };
  const [kopf, daten, sig] = teile;
  const erwartet = Buffer.from(signatur(`${kopf}.${daten}`));
  const erhalten = Buffer.from(sig);
  if (erwartet.length !== erhalten.length || !crypto.timingSafeEqual(erwartet, erhalten)) {
    return { ok: false, grund: 'signatur' };
  }
  let payload;
  try {
    payload = JSON.parse(Buffer.from(daten, 'base64url').toString('utf8'));
  } catch {
    return { ok: false, grund: 'format' };
  }
  if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
    return { ok: false, grund: 'abgelaufen', payload };
  }
  return { ok: true, payload };
}
