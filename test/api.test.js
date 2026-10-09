import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { erstelleServer } from '../server.js';
import { LOESUNGEN } from '../src/daten.js';

let server;
let basis;

before(async () => {
  server = erstelleServer();
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  basis = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.closeAllConnections?.();
  server.close();
});

/** Kleiner Client, der sich wie ein Browser die Spieler-ID merkt. */
function neuerClient() {
  let cookie = '';
  return async function anfrage(pfad, { methode = 'GET', json, body, header = {}, umleiten = 'follow' } = {}) {
    const kopf = { ...header };
    if (cookie) kopf.Cookie = cookie;
    if (json !== undefined) {
      kopf['Content-Type'] = 'application/json';
      body = JSON.stringify(json);
    }
    const res = await fetch(basis + pfad, { method: methode, headers: kopf, body, redirect: umleiten });
    const gesetzt = res.headers.get('set-cookie');
    if (gesetzt) cookie = gesetzt.split(';')[0];
    const text = await res.text();
    let daten = text;
    try {
      daten = JSON.parse(text);
    } catch {
      /* kein JSON */
    }
    return { status: res.status, header: res.headers, daten, text };
  };
}

async function fortschritt(anfrage) {
  return (await anfrage('/api/fortschritt')).daten;
}

test('Startseite und statische Dateien werden ausgeliefert', async () => {
  const res = await fetch(`${basis}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
  assert.equal((await fetch(`${basis}/../server.js`)).status, 404);
  assert.equal((await fetch(`${basis}/%2e%2e/server.js`)).status, 404);
});

test('Die Startseite vergibt die Spieler-ID, die API übernimmt sie', async () => {
  const seite = await fetch(`${basis}/`);
  const cookie = seite.headers.get('set-cookie').split(';')[0];
  assert.match(cookie, /^spieler_id=[a-f0-9]{12}$/);
  const res = await fetch(`${basis}/api/fortschritt`, { headers: { Cookie: cookie } });
  assert.equal((await res.json()).spieler_id, cookie.split('=')[1]);
  assert.equal(res.headers.get('set-cookie'), null);
  const nochmal = await fetch(`${basis}/`, { headers: { Cookie: cookie } });
  assert.equal(nochmal.headers.get('set-cookie'), null);
});

test('hallo: JSON, XML per Accept, 405 und Umleitung', async () => {
  const a = neuerClient();
  const r = await a('/api/hallo');
  assert.equal(r.status, 200);
  assert.match(r.daten.nachricht, /Hallo/);
  assert.ok(r.header.get('x-anfrage-id'));

  const xml = await a('/api/hallo', { header: { Accept: 'application/xml' } });
  assert.match(xml.header.get('content-type'), /xml/);
  assert.match(xml.text, /<antwort>/);

  const browser = await a('/api/hallo', { header: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9' } });
  assert.match(browser.header.get('content-type'), /json/);

  const falsch = await a('/api/hallo', { methode: 'DELETE' });
  assert.equal(falsch.status, 405);
  assert.match(falsch.header.get('allow'), /GET/);

  const alt = await a('/api/v1/hallo', { umleiten: 'manual' });
  assert.equal(alt.status, 301);
  assert.equal(alt.header.get('location'), '/api/hallo');

  const p = await fortschritt(a);
  assert.ok(p.erfolge.includes('accept_xml'));
  assert.ok(p.erfolge.includes('konsole_fetch'), 'Anfragen ohne X-Quelle zählen als selbst geschrieben');
  for (const code of [200, 301, 405]) assert.ok(p.statuscodes.includes(code));
});

test('Spielseiten-Anfragen zählen nicht als Konsolen-Anfrage', async () => {
  const a = neuerClient();
  await a('/api/hallo', { header: { 'X-Quelle': 'spielseite' } });
  assert.ok(!(await fortschritt(a)).erfolge.includes('konsole_fetch'));
});

test('wetter: Parameter, Umlaute und Fehler', async () => {
  const a = neuerClient();
  assert.equal((await a('/api/wetter')).status, 400);
  assert.equal((await a('/api/wetter?stadt=Atlantis')).status, 404);
  const m = await a(`/api/wetter?stadt=${encodeURIComponent('München')}`);
  assert.equal(m.status, 200);
  assert.equal(m.daten.stadt, 'München');
  const f = await a('/api/wetter?stadt=Berlin&einheit=fahrenheit');
  assert.equal(f.daten.einheit, '°F');
  assert.equal((await a('/api/wetter?stadt=Berlin&einheit=kelvin')).status, 400);
  assert.ok((await fortschritt(a)).erfolge.includes('wetter_muenchen'));
});

test('geheimnis + pruefen', async () => {
  const a = neuerClient();
  const g = await a('/api/geheimnis');
  const hinweis = g.header.get('x-geheimer-hinweis');
  assert.ok(g.daten.geheimcode && hinweis);
  const pruef = (aufgabe, antwort) => a('/api/pruefen', { methode: 'POST', json: { aufgabe, antwort } });
  assert.equal((await pruef('geheimcode', g.daten.geheimcode.toLowerCase())).daten.richtig, true);
  assert.equal((await pruef('geheimcode', 'falsch')).daten.richtig, false);
  assert.equal((await pruef('geheimhinweis', hinweis)).daten.richtig, true);
  assert.equal((await pruef('fehlerfeld', 'PLZ')).daten.richtig, true);
  const id = (await fortschritt(a)).spieler_id;
  assert.equal((await pruef('spieler_id', id)).daten.richtig, true);
  assert.equal((await pruef('bestellbetrag', String(LOESUNGEN.bestellbetrag).replace('.', ',') + ' €')).daten.richtig, true);
  assert.equal((await pruef('kunden_hamburg', '4')).daten.richtig, true);
  assert.equal((await pruef('soap_bestand', '57')).daten.richtig, true);
  assert.equal((await pruef('graphql_bestellungen', '3')).daten.richtig, true);
  assert.equal((await pruef('gibtsnicht', 'x')).status, 404);
});

test('paket: 422 ohne plz, 201 mit plz', async () => {
  const a = neuerClient();
  const ohne = await a('/api/paket', { methode: 'POST', json: { empfaenger: 'A', strasse: 'B 1', ort: 'C' } });
  assert.equal(ohne.status, 422);
  assert.equal(ohne.daten.details[0].feld, 'plz');
  const mit = await a('/api/paket', { methode: 'POST', json: { empfaenger: 'A', strasse: 'B 1', plz: '12345', ort: 'C' } });
  assert.equal(mit.status, 201);
});

test('notizen: kompletter CRUD-Ablauf', async () => {
  const a = neuerClient();
  const liste = await a('/api/notizen');
  assert.equal(liste.status, 200);
  assert.equal(liste.daten.length, 1);

  const ohneTyp = await a('/api/notizen', { methode: 'POST', body: '{"titel":"x"}' });
  assert.equal(ohneTyp.status, 415);
  const kaputt = await a('/api/notizen', { methode: 'POST', body: '{titel:}', header: { 'Content-Type': 'application/json' } });
  assert.equal(kaputt.status, 400);
  assert.equal((await a('/api/notizen', { methode: 'POST', json: { text: 'ohne titel' } })).status, 400);

  const neu = await a('/api/notizen', { methode: 'POST', json: { titel: 'Meine erste Notiz', text: 'Hallo' } });
  assert.equal(neu.status, 201);
  assert.equal(neu.header.get('location'), `/api/notizen/${neu.daten.id}`);

  assert.equal((await a(`/api/notizen/${neu.daten.id}`, { methode: 'PUT', json: { titel: 'nur titel' } })).status, 400);
  const put = await a(`/api/notizen/${neu.daten.id}`, { methode: 'PUT', json: { titel: 'Neu', text: 'Komplett' } });
  assert.equal(put.daten.titel, 'Neu');
  const patch = await a(`/api/notizen/${neu.daten.id}`, { methode: 'PATCH', json: { titel: 'Geändert' } });
  assert.equal(patch.daten.titel, 'Geändert');
  assert.equal(patch.daten.text, 'Komplett');

  assert.equal((await a(`/api/notizen/${neu.daten.id}`, { methode: 'DELETE' })).status, 204);
  assert.equal((await a(`/api/notizen/${neu.daten.id}`, { methode: 'DELETE' })).status, 404);

  const p = await fortschritt(a);
  for (const e of ['notizen_gelesen', 'notiz_erstellt', 'notiz_geaendert', 'notiz_geloescht', 'konsole_post']) {
    assert.ok(p.erfolge.includes(e), e);
  }
});

test('Werkstatt-Anfragen zählen nicht für konsole_post', async () => {
  const a = neuerClient();
  await a('/api/notizen', { methode: 'POST', json: { titel: 'x' }, header: { 'X-Quelle': 'werkstatt' } });
  const p = await fortschritt(a);
  assert.ok(p.erfolge.includes('notiz_erstellt'));
  assert.ok(!p.erfolge.includes('konsole_post'));
});

test('Statuscodes provozieren: 418, 500, 503, 429, 413, 404', async () => {
  const a = neuerClient();
  assert.equal((await a('/api/teekanne')).status, 418);
  assert.equal((await a('/api/kaputt')).status, 500);
  const w = await a('/api/wartung');
  assert.equal(w.status, 503);
  assert.equal(w.header.get('retry-after'), '120');
  const codes = [];
  for (let i = 0; i < 4; i++) codes.push((await a('/api/kekse')).status);
  assert.deepEqual(codes, [200, 200, 200, 429]);
  const gross = await a('/api/notizen', { methode: 'POST', json: { titel: 'x', text: 'y'.repeat(70 * 1024) } });
  assert.equal(gross.status, 413);
  assert.equal((await a('/api/einhorn')).status, 404);
  const p = await fortschritt(a);
  for (const code of [418, 500, 503, 429, 413, 404]) assert.ok(p.statuscodes.includes(code), String(code));
});

test('Sicherheit: API-Key, Login, Token, 401 und 403', async () => {
  const a = neuerClient();
  assert.equal((await a('/api/tresor')).status, 401);
  const key = (await a('/api/entwicklerportal')).daten.api_key;
  const url = await a(`/api/tresor?api_key=${key}`);
  assert.equal(url.status, 401);
  assert.match(url.daten.nachricht, /Header/);
  assert.equal((await a('/api/tresor', { header: { 'X-API-Key': 'falsch' } })).status, 401);
  assert.equal((await a('/api/tresor', { header: { 'X-API-Key': key } })).status, 200);

  assert.equal((await a('/api/login', { methode: 'POST', json: { benutzername: 'azubi', passwort: 'x' } })).status, 401);
  const login = await a('/api/login', { methode: 'POST', json: { benutzername: 'azubi', passwort: 'schnittstelle' } });
  assert.equal(login.status, 200);
  const token = login.daten.token;
  assert.equal(token.split('.').length, 3);

  assert.equal((await a('/api/profil')).status, 401);
  const platzhalter = await a('/api/profil', { header: { Authorization: 'Bearer HIER_DEN_TOKEN_EINFUEGEN' } });
  assert.match(platzhalter.daten.fehler, /Platzhalter/);
  assert.equal((await a('/api/profil', { header: { Authorization: `Bearer ${token}x` } })).status, 401);
  const profil = await a('/api/profil', { header: { Authorization: `Bearer ${token}` } });
  assert.equal(profil.status, 200);
  assert.equal(profil.daten.rolle, 'azubi');
  assert.equal((await a('/api/admin', { header: { Authorization: `Bearer ${token}` } })).status, 403);

  const p = await fortschritt(a);
  for (const e of ['tresor_offen', 'login', 'profil_gelesen', 'admin_403']) assert.ok(p.erfolge.includes(e), e);
});

test('Roboter: alle drei Level sind lösbar', async () => {
  const a = neuerClient();
  const gehe = (richtung, schritte) => a('/api/roboter/bewegen', { methode: 'POST', json: { richtung, schritte } });

  assert.equal((await a('/api/roboter/bewegen', { methode: 'POST', json: { richtung: 'diagonal' } })).status, 400);
  assert.equal((await a('/api/roboter/bewegen', { methode: 'POST', json: { richtung: 'rechts', schritte: '2' } })).status, 400);

  let r = await gehe('rechts', 10);
  assert.equal(r.daten.am_ziel, true);
  assert.equal((await gehe('rechts', 1)).status, 409);

  assert.equal((await a('/api/roboter/neustart', { methode: 'POST', json: { level: 3 } })).status, 403);
  assert.equal((await a('/api/roboter/neustart', { methode: 'POST', json: { level: 2 } })).status, 200);
  for (const [richtung, n] of [['oben', 3], ['rechts', 3], ['unten', 2], ['rechts', 3], ['oben', 3]]) r = await gehe(richtung, n);
  assert.equal(r.daten.am_ziel, true, JSON.stringify(r.daten.position));

  await a('/api/roboter/neustart', { methode: 'POST', json: { level: 3 } });
  const weg = [['rechts', 1], ['unten', 3], ['rechts', 2], ['oben', 3], ['rechts', 2], ['unten', 2], ['rechts', 2], ['unten', 3]];
  for (const [richtung, n] of weg) r = await gehe(richtung, n);
  assert.equal(r.daten.am_ziel, true, JSON.stringify(r.daten.position));

  const mauer = await a('/api/roboter/neustart', { methode: 'POST' });
  assert.equal(mauer.status, 200);
  const anstoss = await gehe('rechts', 5);
  assert.equal(anstoss.daten.position.x, 1);
  assert.match(anstoss.daten.meldung, /Mauer/);

  assert.equal((await a('/api/roboter', { methode: 'PATCH', json: { farbe: 'regenbogen' } })).status, 400);
  assert.equal((await a('/api/roboter', { methode: 'PATCH', json: { farbe: 'Lila', name: 'Robo' } })).daten.name, 'Robo');
  assert.equal((await a('/api/roboter/sprechen', { methode: 'POST', json: { text: 'Hallo!' } })).daten.sagt, 'Hallo!');

  const p = await fortschritt(a);
  for (const e of ['roboter_bewegt', 'roboter_ziel_1', 'roboter_ziel_2', 'roboter_ziel_3', 'roboter_farbe', 'roboter_spricht']) {
    assert.ok(p.erfolge.includes(e), e);
  }
});

test('REST-Firmendaten: Filter, Seiten, Detektiv-Rätsel', async () => {
  const a = neuerClient();
  const seite1 = await a('/api/kunden');
  assert.equal(seite1.daten.daten.length, 5);
  assert.equal(seite1.daten.meta.gesamt, 12);
  assert.ok(seite1.daten.links.naechste);
  const hh = await a('/api/kunden?stadt=hamburg');
  assert.equal(hh.daten.meta.gesamt, LOESUNGEN.kundenHamburg);
  const such = await a('/api/kunden?name=Mustermann');
  assert.equal(such.daten.meta.gesamt, 2);
  const erika = such.daten.daten.find((k) => k.name === 'Erika Mustermann');
  const best = await a(`/api/kunden/${erika.id}/bestellungen`);
  assert.equal(best.daten.bestellungen.at(-1).gesamtbetrag, LOESUNGEN.bestellbetrag);
  assert.equal((await a('/api/kunden/999')).status, 404);
  assert.equal((await a('/api/kunden?limit=0')).status, 400);
  assert.equal((await a('/api/produkte/A-1002')).status, 200);
});

const soap = (inhalt) => `<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:lag="urn:mission-schnittstelle:lager">
  <soap:Header/>
  <soap:Body>${inhalt}</soap:Body>
</soap:Envelope>`;

test('SOAP: WSDL, Abfrage und Fault', async () => {
  const a = neuerClient();
  const w = await a('/soap/lager?wsdl');
  assert.equal(w.status, 200);
  assert.match(w.text, /LagerbestandAbfragen/);
  assert.equal((await a('/soap/lager')).status, 405);

  const xmlKopf = { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '"urn:LagerbestandAbfragen"' };
  const ok = await a('/soap/lager', {
    methode: 'POST',
    header: xmlKopf,
    body: soap('<lag:LagerbestandAbfragen><lag:artikelnummer>A-1002</lag:artikelnummer></lag:LagerbestandAbfragen>'),
  });
  assert.equal(ok.status, 200);
  assert.match(ok.text, /<lag:bestand>57<\/lag:bestand>/);

  const fault = await a('/soap/lager', {
    methode: 'POST',
    header: xmlKopf,
    body: soap('<lag:LagerbestandAbfragen><lag:artikelnummer>A-9999</lag:artikelnummer></lag:LagerbestandAbfragen>'),
  });
  assert.equal(fault.status, 500);
  assert.match(fault.text, /soap:Fault/);

  const liste = await a('/soap/lager', { methode: 'POST', header: xmlKopf, body: soap('<lag:ArtikelAuflisten/>') });
  assert.equal(liste.status, 200);
  assert.match(liste.text, /A-1008/);

  assert.equal((await a('/soap/lager', { methode: 'POST', json: {} })).status, 415);
  const p = await fortschritt(a);
  for (const e of ['wsdl_gelesen', 'soap_anfrage', 'soap_fault']) assert.ok(p.erfolge.includes(e), e);
});

test('GraphQL: Abfragen, Fehler und Syntaxfehler', async () => {
  const a = neuerClient();
  const gql = (query, variables) => a('/graphql', { methode: 'POST', json: { query, variables } });

  const r = await gql('{ kunden { name stadt } }');
  assert.equal(r.status, 200);
  assert.equal(r.daten.data.kunden.length, 12);
  assert.deepEqual(Object.keys(r.daten.data.kunden[0]), ['name', 'stadt']);

  const k = await gql('query Detail($id: Int!) { kunde(id: $id) { name bestellungen { nummer gesamtbetrag } } }', { id: 3 });
  assert.equal(k.daten.data.kunde.bestellungen.length, LOESUNGEN.bestellungenKunde3);

  const alias = await gql('{ erster: kunde(id: 1) { name __typename } }');
  assert.equal(alias.daten.data.erster.__typename, 'Kunde');

  const feldFehler = await gql('{ kunden { telefon } }');
  assert.equal(feldFehler.status, 200);
  assert.match(feldFehler.daten.errors[0].message, /telefon/);

  assert.equal((await gql('{ kunden { name }')).status, 400);
  assert.equal((await gql('mutation { x }')).status, 400);
  assert.match((await a('/graphql')).text, /type Query/);
  assert.equal((await a(`/graphql?query=${encodeURIComponent('{ produkte { name } }')}`)).status, 200);
});

test('Abschlussmission: Auftrag → SOAP-Prüfung → Lieferung', async () => {
  const a = neuerClient();
  assert.equal((await a('/api/auftrag')).status, 401);
  const token = (await a('/api/login', { methode: 'POST', json: { benutzername: 'azubi', passwort: 'schnittstelle' } })).daten.token;
  const auth = { Authorization: `Bearer ${token}` };

  const auftrag = (await a('/api/auftrag', { header: auth })).daten;
  const body = { auftragsnummer: auftrag.auftragsnummer, kunde_id: auftrag.kunde.id, artikelnummer: auftrag.artikelnummer, menge: auftrag.menge };

  const zuFrueh = await a('/api/lieferungen', { methode: 'POST', json: body, header: auth });
  assert.equal(zuFrueh.status, 409);

  await a('/soap/lager', {
    methode: 'POST',
    header: { 'Content-Type': 'text/xml' },
    body: soap(`<lag:LagerbestandAbfragen><lag:artikelnummer>${auftrag.artikelnummer}</lag:artikelnummer></lag:LagerbestandAbfragen>`),
  });

  const falscherTyp = await a('/api/lieferungen', { methode: 'POST', json: { ...body, menge: String(body.menge) }, header: auth });
  assert.equal(falscherTyp.status, 422);
  assert.match(falscherTyp.daten.details[0].problem, /Typ/);

  const ok = await a('/api/lieferungen', { methode: 'POST', json: body, header: auth });
  assert.equal(ok.status, 201);
  assert.equal((await a('/api/lieferungen', { methode: 'POST', json: body, header: auth })).status, 409);

  const p = await fortschritt(a);
  for (const e of ['auftrag_erhalten', 'auftrag_lager_geprueft', 'auftrag_abgeschlossen']) assert.ok(p.erfolge.includes(e), e);
});

test('Spieler-ID per Header für externe Werkzeuge', async () => {
  const a = neuerClient();
  const id = (await fortschritt(a)).spieler_id;
  const res = await fetch(`${basis}/api/fortschritt`, { headers: { 'X-Spieler-ID': id } });
  assert.equal((await res.json()).spieler_id, id);
});

test('Server-Sent Events liefern init und Live-Ereignisse', async () => {
  const a = neuerClient();
  const id = (await fortschritt(a)).spieler_id;
  const controller = new AbortController();
  const res = await fetch(`${basis}/api/ereignisse`, { headers: { Cookie: `spieler_id=${id}` }, signal: controller.signal });
  assert.match(res.headers.get('content-type'), /text\/event-stream/);
  const leser = res.body.getReader();
  let text = '';
  const lies = async (bis) => {
    while (!text.includes(bis)) text += new TextDecoder().decode((await leser.read()).value);
  };
  await lies('event: init');
  await a('/api/roboter/bewegen', { methode: 'POST', json: { richtung: 'rechts' } });
  await lies('event: roboter');
  assert.match(text, /event: erfolg/);
  controller.abort();
});

test('OPTIONS liefert erlaubte Methoden und CORS-Header', async () => {
  const res = await fetch(`${basis}/api/notizen/1`, { method: 'OPTIONS' });
  assert.equal(res.status, 204);
  assert.match(res.headers.get('allow'), /PATCH/);
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
});
