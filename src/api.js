import { ApiFehler } from './hilfen.js';
import { antworte, erstelleKontext } from './kontext.js';
import { parameterAus } from './router.js';
import basis from './routen/basis.js';
import notizen from './routen/notizen.js';
import sicherheit from './routen/sicherheit.js';
import roboter from './routen/roboter.js';
import firma from './routen/firma.js';
import soap from './routen/soap.js';
import graphql from './routen/graphql.js';
import mission from './routen/mission.js';
import spiel from './routen/spiel.js';

const ROUTEN = [...basis, ...notizen, ...sicherheit, ...roboter, ...firma, ...soap, ...graphql, ...mission, ...spiel];

export const istApiPfad = (pfad) => /^\/(api|soap)(\/|$)/.test(pfad) || /^\/graphql\/?$/.test(pfad);

const ANFRAGEN_PRO_MINUTE = 300;

function pruefeGesamtlimit(spieler) {
  const jetzt = Date.now();
  spieler.anfrageZeiten = spieler.anfrageZeiten.filter((t) => jetzt - t < 60 * 1000);
  spieler.anfrageZeiten.push(jetzt);
  if (spieler.anfrageZeiten.length > ANFRAGEN_PRO_MINUTE) {
    throw new ApiFehler(
      429,
      {
        fehler: 'Zu viele Anfragen',
        nachricht: `Mehr als ${ANFRAGEN_PRO_MINUTE} Anfragen pro Minute – läuft da eine Endlosschleife? Kurz durchatmen. 🙂`,
      },
      { 'Retry-After': '30' },
    );
  }
}

export async function verarbeiteApi(req, res, url) {
  const ctx = erstelleKontext(req, res, url);
  try {
    pruefeGesamtlimit(ctx.spieler);

    const kandidaten = ROUTEN.filter((r) => r.regex.test(ctx.pfad));
    if (!kandidaten.length) {
      throw new ApiFehler(404, {
        fehler: 'Nicht gefunden',
        nachricht: `Unter ${ctx.pfad} gibt es keinen Endpunkt.`,
        tipp: 'Alle Endpunkte siehst du unter GET /api – oder im API-Handbuch des Spiels.',
      });
    }

    const methoden = [...new Set(kandidaten.map((r) => r.methode))];
    if (methoden.includes('GET')) methoden.push('HEAD');
    methoden.push('OPTIONS');
    const erlaubt = methoden.join(', ');

    if (ctx.methode === 'OPTIONS') return antworte(ctx, 204, null, { Allow: erlaubt });

    const passend =
      kandidaten.find((r) => r.methode === ctx.methode) ??
      (ctx.methode === 'HEAD' ? kandidaten.find((r) => r.methode === 'GET') : undefined);
    if (!passend) {
      throw new ApiFehler(
        405,
        {
          fehler: 'Methode nicht erlaubt',
          nachricht: `${ctx.methode} ist für ${ctx.pfad} nicht erlaubt.`,
          erlaubte_methoden: methoden,
        },
        { Allow: erlaubt },
      );
    }

    ctx.params = parameterAus(passend, ctx.pfad);
    await passend.handler(ctx);
  } catch (e) {
    if (e instanceof ApiFehler) {
      const daten = e.daten;
      return antworte(ctx, e.status, daten, e.header);
    }
    console.error('Unerwarteter Fehler:', e);
    antworte(ctx, 500, {
      fehler: 'Interner Serverfehler',
      nachricht: 'Da ist auf dem Server etwas Unerwartetes passiert. Das ist nicht deine Schuld.',
      anfrage_id: ctx.anfrageId,
    });
  }
}
