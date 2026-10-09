import { route } from '../router.js';
import { antworte, leseJsonObjekt } from '../kontext.js';
import { ApiFehler } from '../hilfen.js';
import { pruefeJwt, signiereJwt } from '../jwt.js';

export const BENUTZER = { benutzername: 'azubi', passwort: 'schnittstelle' };
const TOKEN_DAUER_S = 15 * 60;
const BEARER_HEADER = { 'WWW-Authenticate': 'Bearer realm="mission-schnittstelle"' };

function tresor(ctx) {
  const key = ctx.req.headers['x-api-key'];
  if (!key) {
    const inUrl = ['api_key', 'apikey', 'key', 'x-api-key'].some((p) => ctx.query.has(p));
    throw new ApiFehler(
      401,
      inUrl
        ? {
            fehler: 'API-Key an der falschen Stelle',
            nachricht:
              'Du hast den Schlüssel in die URL geschrieben. Dieser Tresor erwartet ihn im Header "X-API-Key". URLs landen in Logs und im Browserverlauf – Header nicht.',
          }
        : {
            fehler: 'Nicht autorisiert',
            nachricht: 'Der Tresor ist verschlossen. 🔒 Schicke deinen API-Key im Header "X-API-Key" mit.',
          },
      { 'WWW-Authenticate': 'ApiKey header="X-API-Key"' },
    );
  }
  if (key.trim() !== ctx.spieler.apiKey) {
    throw new ApiFehler(401, {
      fehler: 'Ungültiger API-Key',
      nachricht: 'Dieser Schlüssel passt nicht. Achte auf Tippfehler und überflüssige Leerzeichen.',
    });
  }
  ctx.spieler.erfolg('tresor_offen');
  return antworte(ctx, 200, {
    nachricht: 'Der Tresor ist offen! 💎',
    inhalt: ['Ein goldener USB-Stecker', 'Das Rezept für gute Schnittstellen: klare Doku, klare Fehler, klare Verträge'],
    merke: 'Wer den Schlüssel hat, kommt rein. Deshalb gibt man API-Keys niemals weiter.',
  });
}

function entwicklerportal(ctx) {
  return antworte(ctx, 200, {
    api_key: ctx.spieler.apiKey,
    hinweis: 'Dieser Schlüssel gehört nur dir. Im echten Leben: niemals teilen!',
  });
}

async function login(ctx) {
  const d = await leseJsonObjekt(ctx);
  if (!d.benutzername || !d.passwort) {
    throw new ApiFehler(400, {
      fehler: 'Unvollständige Anmeldedaten',
      nachricht: 'Bitte schicke "benutzername" und "passwort" im JSON-Body.',
      beispiel: { benutzername: 'azubi', passwort: '…' },
    });
  }
  const name = String(d.benutzername).trim().toLowerCase();
  if (name !== BENUTZER.benutzername || String(d.passwort) !== BENUTZER.passwort) {
    throw new ApiFehler(401, {
      fehler: 'Anmeldung fehlgeschlagen',
      nachricht: 'Benutzername oder Passwort ist falsch.',
    });
  }
  const jetzt = Math.floor(Date.now() / 1000);
  const token = signiereJwt({ sub: ctx.spieler.id, name: 'azubi', rolle: 'azubi', iat: jetzt, exp: jetzt + TOKEN_DAUER_S });
  ctx.spieler.erfolg('login');
  return antworte(ctx, 200, {
    nachricht: 'Anmeldung erfolgreich! 🎟️',
    token,
    token_typ: 'Bearer',
    gueltig_fuer_sekunden: TOKEN_DAUER_S,
    gueltig_bis: new Date((jetzt + TOKEN_DAUER_S) * 1000).toISOString(),
    so_benutzt_du_ihn: 'Schicke bei den nächsten Anfragen den Header  Authorization: Bearer <token>',
  });
}

/** Prüft den Authorization-Header und gibt den Token-Inhalt zurück – oder wirft 401. */
export function brauchtToken(ctx) {
  const auth = ctx.req.headers.authorization;
  if (!auth) {
    throw new ApiFehler(
      401,
      {
        fehler: 'Nicht angemeldet',
        nachricht:
          'Hierfür brauchst du ein Token. Schicke den Header "Authorization: Bearer <dein Token>". Ein Token bekommst du über POST /api/login.',
      },
      BEARER_HEADER,
    );
  }
  const treffer = auth.match(/^Bearer\s+(.+)$/i);
  if (!treffer) {
    throw new ApiFehler(
      401,
      {
        fehler: 'Authorization-Header falsch aufgebaut',
        nachricht: 'So muss er aussehen: "Bearer eyJ…" – erst das Wort Bearer, dann ein Leerzeichen, dann das Token.',
      },
      BEARER_HEADER,
    );
  }
  const token = treffer[1].trim().replace(/^["'<]+|["'>]+$/g, '');
  if (/HIER|EINFUEGEN|TOKEN$/i.test(token) && token.split('.').length !== 3) {
    throw new ApiFehler(
      401,
      {
        fehler: 'Platzhalter statt Token',
        nachricht: 'Du hast noch den Platzhalter mitgeschickt. Ersetze ihn durch das echte Token aus der Login-Antwort.',
      },
      BEARER_HEADER,
    );
  }
  const pruefung = pruefeJwt(token);
  if (!pruefung.ok) {
    throw new ApiFehler(
      401,
      pruefung.grund === 'abgelaufen'
        ? {
            fehler: 'Token abgelaufen',
            nachricht: 'Tokens sind nur 15 Minuten gültig. Hol dir per POST /api/login ein neues.',
          }
        : {
            fehler: 'Token ungültig',
            nachricht:
              'Das Token ist unvollständig, verändert oder stammt nicht von diesem Server (z. B. nach einem Neustart). Hol dir per POST /api/login ein neues.',
          },
      BEARER_HEADER,
    );
  }
  return pruefung.payload;
}

function profil(ctx) {
  const t = brauchtToken(ctx);
  ctx.spieler.erfolg('profil_gelesen');
  return antworte(ctx, 200, {
    nachricht: 'Willkommen in deinem Profil! Das Token hat funktioniert. ✅',
    benutzername: t.name,
    rolle: t.rolle,
    spieler_id: t.sub,
    token_ausgestellt: new Date(t.iat * 1000).toISOString(),
    token_gueltig_bis: new Date(t.exp * 1000).toISOString(),
  });
}

function admin(ctx) {
  const t = brauchtToken(ctx);
  if (t.rolle !== 'admin') {
    ctx.spieler.erfolg('admin_403');
    throw new ApiFehler(403, {
      fehler: 'Zugriff verboten',
      nachricht: `Wir wissen, wer du bist (${t.name}) – aber mit der Rolle "${t.rolle}" darfst du nicht in den Admin-Bereich.`,
      merke: '401 = "Wer bist du?" (nicht angemeldet).  403 = "Ich kenne dich, aber du darfst das nicht."',
    });
  }
  return antworte(ctx, 200, { nachricht: 'Hallo Admin!' });
}

export default [
  route('GET', '/api/tresor', tresor),
  route('GET', '/api/entwicklerportal', entwicklerportal),
  route('POST', '/api/login', login),
  route('GET', '/api/profil', profil),
  route('GET', '/api/admin', admin),
];
