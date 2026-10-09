import { store } from '../zustand.js';
import k01 from './k01-schnittstelle.js';
import k02 from './k02-anfrage-antwort.js';
import k03 from './k03-urls.js';
import k04 from './k04-devtools.js';
import k05 from './k05-methoden.js';
import k06 from './k06-statuscodes.js';
import k07 from './k07-datenformate.js';
import k08 from './k08-header-auth.js';
import k09 from './k09-konsole.js';
import k10 from './k10-rest.js';
import k11 from './k11-soap.js';
import k12 from './k12-graphql-familie.js';
import k13 from './k13-abschluss.js';

export const KAPITEL = [k01, k02, k03, k04, k05, k06, k07, k08, k09, k10, k11, k12, k13].map((k, i) => ({ ...k, nummer: i + 1 }));

/** Ein Kapitel ist frei, wenn das vorherige abgeschlossen ist (oder alles freigeschaltet wurde). */
export function kapitelFrei(index) {
  if (index <= 0 || store.daten.alleFrei) return true;
  return store.kapitelFertig(KAPITEL[index - 1].id);
}
