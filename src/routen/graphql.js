import { route } from '../router.js';
import { antworte, leseJson } from '../kontext.js';
import { ApiFehler, istObjekt } from '../hilfen.js';
import { GraphQLSyntaxFehler, SCHEMA_TEXT, graphql } from '../graphql.js';

function ausfuehren(ctx, abfrage, variablen) {
  if (typeof abfrage !== 'string' || !abfrage.trim()) {
    throw new ApiFehler(400, {
      errors: [{ message: 'Es fehlt das Feld "query" mit deiner Abfrage, z. B. { "query": "{ kunden { name } }" }' }],
    });
  }
  let ergebnis;
  try {
    ergebnis = graphql(abfrage, istObjekt(variablen) ? variablen : {});
  } catch (e) {
    if (e instanceof GraphQLSyntaxFehler) throw new ApiFehler(400, { errors: [{ message: `Syntaxfehler: ${e.message}` }] });
    throw e;
  }
  if (!ergebnis.errors) ctx.spieler.erfolg('graphql_anfrage');
  else ctx.spieler.erfolg('graphql_fehler');
  // Typisch für GraphQL: Auch bei Feld-Fehlern ist der Statuscode 200 – die Fehler stehen in "errors".
  return antworte(ctx, 200, ergebnis);
}

async function post(ctx) {
  const d = await leseJson(ctx);
  if (!istObjekt(d)) throw new ApiFehler(400, { errors: [{ message: 'Der Body muss ein JSON-Objekt mit dem Feld "query" sein.' }] });
  return ausfuehren(ctx, d.query, d.variables);
}

function get(ctx) {
  const abfrage = ctx.query.get('query');
  if (!abfrage) {
    return antworte(ctx, 200, SCHEMA_TEXT, { 'Content-Type': 'text/plain; charset=utf-8' });
  }
  let variablen = {};
  try {
    variablen = JSON.parse(ctx.query.get('variables') || '{}');
  } catch {
    throw new ApiFehler(400, { errors: [{ message: '"variables" ist kein gültiges JSON.' }] });
  }
  return ausfuehren(ctx, abfrage, variablen);
}

export default [route('POST', '/graphql', post), route('GET', '/graphql', get)];
