// Beschreibung aller Endpunkte – für das API-Handbuch und die Vorlagen der Werkstatt.

const JSON_KOPF = [['Content-Type', 'application/json']];
const SOAP_KOPF = [
  ['Content-Type', 'text/xml; charset=utf-8'],
  ['SOAPAction', '"urn:LagerbestandAbfragen"'],
];

export const soapUmschlag = (artikelnummer = 'A-1001') => `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:lag="urn:mission-schnittstelle:lager">
  <soap:Header/>
  <soap:Body>
    <lag:LagerbestandAbfragen>
      <lag:artikelnummer>${artikelnummer}</lag:artikelnummer>
    </lag:LagerbestandAbfragen>
  </soap:Body>
</soap:Envelope>`;

const json = (objekt) => JSON.stringify(objekt, null, 2);

export const GRUPPEN = [
  {
    titel: 'Erste Schritte',
    endpunkte: [
      {
        methode: 'GET',
        pfad: '/api/hallo',
        beschreibung: 'Begrüßung. Mit dem Header „Accept: application/xml“ kommt die Antwort als XML.',
        vorlage: { name: 'Hallo sagen', methode: 'GET', url: '/api/hallo', header: [['Accept', 'application/json']] },
      },
      {
        methode: 'GET',
        pfad: '/api/wetter?stadt={stadt}&einheit={einheit}',
        beschreibung: 'Übungs-Wetterdaten. „stadt“ ist Pflicht, „einheit“ optional (celsius oder fahrenheit).',
        vorlage: { name: 'Wetter abfragen', methode: 'GET', url: '/api/wetter?stadt=Berlin' },
      },
      {
        methode: 'GET',
        pfad: '/api',
        beschreibung: 'Übersicht über die wichtigsten Endpunkte und deine Spieler-ID.',
        vorlage: { name: 'API-Übersicht', methode: 'GET', url: '/api' },
      },
    ],
  },
  {
    titel: 'Notizen (CRUD)',
    endpunkte: [
      { methode: 'GET', pfad: '/api/notizen', beschreibung: 'Alle deine Notizen als Liste.', vorlage: { name: 'Notizen lesen', methode: 'GET', url: '/api/notizen' } },
      {
        methode: 'POST',
        pfad: '/api/notizen',
        beschreibung: 'Neue Notiz anlegen. Body: titel (Pflicht), text (optional). Antwort: 201 + Header Location.',
        vorlage: {
          name: 'Notiz anlegen',
          methode: 'POST',
          url: '/api/notizen',
          header: JSON_KOPF,
          body: json({ titel: 'Meine erste Notiz', text: 'Ich lerne gerade APIs!' }),
        },
      },
      { methode: 'GET', pfad: '/api/notizen/{id}', beschreibung: 'Eine einzelne Notiz.', vorlage: { name: 'Eine Notiz lesen', methode: 'GET', url: '/api/notizen/1' } },
      {
        methode: 'PUT',
        pfad: '/api/notizen/{id}',
        beschreibung: 'Notiz komplett ersetzen – titel UND text sind Pflicht.',
        vorlage: { name: 'Notiz ersetzen (PUT)', methode: 'PUT', url: '/api/notizen/2', header: JSON_KOPF, body: json({ titel: 'Ganz neu', text: 'Alles ersetzt.' }) },
      },
      {
        methode: 'PATCH',
        pfad: '/api/notizen/{id}',
        beschreibung: 'Notiz teilweise ändern – nur die Felder, die sich ändern.',
        vorlage: { name: 'Notiz ändern (PATCH)', methode: 'PATCH', url: '/api/notizen/2', header: JSON_KOPF, body: json({ titel: 'Geänderter Titel' }) },
      },
      {
        methode: 'DELETE',
        pfad: '/api/notizen/{id}',
        beschreibung: 'Notiz löschen. Antwort: 204 No Content (ohne Body).',
        vorlage: { name: 'Notiz löschen', methode: 'DELETE', url: '/api/notizen/2' },
      },
    ],
  },
  {
    titel: 'Statuscodes zum Ausprobieren',
    endpunkte: [
      { methode: 'GET', pfad: '/api/v1/hallo', beschreibung: 'Alte Adresse → 301 Umleitung auf /api/hallo.' },
      { methode: 'GET', pfad: '/api/teekanne', beschreibung: 'Antwortet mit 418 „I’m a teapot“.' },
      { methode: 'GET', pfad: '/api/kekse', beschreibung: 'Rate Limit: mehr als 3 Anfragen in 10 Sekunden → 429.' },
      { methode: 'GET', pfad: '/api/kaputt', beschreibung: 'Absichtlich kaputt → 500.' },
      { methode: 'GET', pfad: '/api/wartung', beschreibung: 'In Wartung → 503 mit Retry-After.' },
      {
        methode: 'POST',
        pfad: '/api/paket',
        beschreibung: 'Paket verschicken. Pflichtfelder: empfaenger, strasse, plz, ort. Fehlt etwas → 422.',
        vorlage: {
          name: 'Paket verschicken',
          methode: 'POST',
          url: '/api/paket',
          header: JSON_KOPF,
          body: json({ empfaenger: 'Erika Mustermann', strasse: 'Musterweg 1', plz: '50667', ort: 'Köln' }),
        },
      },
    ],
  },
  {
    titel: 'JSON-Übung',
    endpunkte: [
      {
        methode: 'POST',
        pfad: '/api/steckbrief',
        beschreibung: 'Prüft deinen JSON-Steckbrief: name (Text), lieblingszahl (Zahl), mag_kaffee (true/false), hobbys (Liste mit mind. 2 Texten).',
        vorlage: {
          name: 'Steckbrief senden',
          methode: 'POST',
          url: '/api/steckbrief',
          header: JSON_KOPF,
          body: json({ name: '', lieblingszahl: 0, mag_kaffee: true, hobbys: [] }),
        },
      },
    ],
  },
  {
    titel: 'Anmeldung & Sicherheit',
    endpunkte: [
      {
        methode: 'GET',
        pfad: '/api/tresor',
        beschreibung: 'Braucht deinen API-Key im Header „X-API-Key“.',
        vorlage: { name: 'Tresor öffnen', methode: 'GET', url: '/api/tresor', header: [['X-API-Key', 'HIER_DEINEN_KEY_EINFUEGEN']] },
      },
      {
        methode: 'POST',
        pfad: '/api/login',
        beschreibung: 'Anmelden (benutzername: azubi, passwort: schnittstelle). Antwort enthält ein Token (15 Minuten gültig).',
        vorlage: { name: 'Login', methode: 'POST', url: '/api/login', header: JSON_KOPF, body: json({ benutzername: 'azubi', passwort: 'schnittstelle' }) },
      },
      {
        methode: 'GET',
        pfad: '/api/profil',
        beschreibung: 'Dein Profil. Braucht „Authorization: Bearer <token>“.',
        vorlage: { name: 'Profil lesen', methode: 'GET', url: '/api/profil', header: [['Authorization', 'Bearer HIER_DEN_TOKEN_EINFUEGEN']] },
      },
      {
        methode: 'GET',
        pfad: '/api/admin',
        beschreibung: 'Admin-Bereich. Mit Azubi-Token → 403 Forbidden.',
        vorlage: { name: 'Admin-Bereich', methode: 'GET', url: '/api/admin', header: [['Authorization', 'Bearer HIER_DEN_TOKEN_EINFUEGEN']] },
      },
    ],
  },
  {
    titel: 'Roboter Bit',
    endpunkte: [
      { methode: 'GET', pfad: '/api/roboter', beschreibung: 'Position, Farbe, Level und Spielfeld von Bit.', vorlage: { name: 'Roboter-Zustand', methode: 'GET', url: '/api/roboter' } },
      {
        methode: 'POST',
        pfad: '/api/roboter/bewegen',
        beschreibung: 'Body: richtung (oben, unten, links, rechts), schritte (1–10, optional).',
        vorlage: { name: 'Roboter bewegen', methode: 'POST', url: '/api/roboter/bewegen', header: JSON_KOPF, body: json({ richtung: 'rechts', schritte: 2 }) },
      },
      {
        methode: 'PATCH',
        pfad: '/api/roboter',
        beschreibung: 'Farbe und/oder Name ändern. Farben: rot, orange, gelb, gruen, blau, lila, pink, tuerkis … oder Hex wie "#ff8800".',
        vorlage: { name: 'Roboter umfärben', methode: 'PATCH', url: '/api/roboter', header: JSON_KOPF, body: json({ farbe: 'lila' }) },
      },
      {
        methode: 'POST',
        pfad: '/api/roboter/sprechen',
        beschreibung: 'Body: text (bis 80 Zeichen) – erscheint in Bits Sprechblase.',
        vorlage: { name: 'Roboter sprechen lassen', methode: 'POST', url: '/api/roboter/sprechen', header: JSON_KOPF, body: json({ text: 'Hallo Welt!' }) },
      },
      {
        methode: 'POST',
        pfad: '/api/roboter/neustart',
        beschreibung: 'Level neu starten. Body optional: { "level": 2 }',
        vorlage: { name: 'Roboter-Neustart', methode: 'POST', url: '/api/roboter/neustart', header: JSON_KOPF, body: json({ level: 1 }) },
      },
    ],
  },
  {
    titel: 'Firmendaten (REST)',
    endpunkte: [
      {
        methode: 'GET',
        pfad: '/api/kunden',
        beschreibung: 'Kundenliste. Parameter: stadt, name, sortierung (z. B. name oder -name), seite, limit (Standard 5).',
        vorlage: { name: 'Kunden auflisten', methode: 'GET', url: '/api/kunden?seite=1&limit=5' },
      },
      { methode: 'GET', pfad: '/api/kunden/{id}', beschreibung: 'Ein Kunde.', vorlage: { name: 'Einen Kunden lesen', methode: 'GET', url: '/api/kunden/1' } },
      {
        methode: 'GET',
        pfad: '/api/kunden/{id}/bestellungen',
        beschreibung: 'Alle Bestellungen eines Kunden (nach Datum sortiert, älteste zuerst).',
        vorlage: { name: 'Bestellungen eines Kunden', methode: 'GET', url: '/api/kunden/1/bestellungen' },
      },
      { methode: 'GET', pfad: '/api/produkte', beschreibung: 'Alle Produkte. Parameter: kategorie.', vorlage: { name: 'Produkte', methode: 'GET', url: '/api/produkte' } },
      { methode: 'GET', pfad: '/api/produkte/{artikelnummer}', beschreibung: 'Ein Produkt, z. B. A-1002.' },
      { methode: 'GET', pfad: '/api/bestellungen/{nummer}', beschreibung: 'Eine Bestellung, z. B. B-1001.' },
    ],
  },
  {
    titel: 'SOAP-Lagerdienst',
    endpunkte: [
      { methode: 'GET', pfad: '/soap/lager?wsdl', beschreibung: 'Der Vertrag (WSDL) des Dienstes.' },
      {
        methode: 'POST',
        pfad: '/soap/lager',
        beschreibung: 'Operationen: LagerbestandAbfragen (artikelnummer), ArtikelAuflisten. Content-Type: text/xml.',
        vorlage: { name: 'SOAP: Lagerbestand abfragen', methode: 'POST', url: '/soap/lager', header: SOAP_KOPF, body: soapUmschlag() },
      },
    ],
  },
  {
    titel: 'GraphQL',
    endpunkte: [
      { methode: 'GET', pfad: '/graphql', beschreibung: 'Ohne Parameter: zeigt das Schema (alle Typen und Felder).' },
      {
        methode: 'POST',
        pfad: '/graphql',
        beschreibung: 'Body: { "query": "…", "variables": { … } }. Typen: Kunde, Bestellung, Position, Produkt.',
        vorlage: { name: 'GraphQL-Abfrage', methode: 'POST', url: '/graphql', header: JSON_KOPF, body: json({ query: '{ kunden { name stadt } }' }) },
      },
    ],
  },
  {
    titel: 'Abschlussmission',
    endpunkte: [
      {
        methode: 'GET',
        pfad: '/api/auftrag',
        beschreibung: 'Dein Integrationsauftrag. Braucht ein Token.',
        vorlage: { name: 'Auftrag holen', methode: 'GET', url: '/api/auftrag', header: [['Authorization', 'Bearer HIER_DEN_TOKEN_EINFUEGEN']] },
      },
      {
        methode: 'POST',
        pfad: '/api/lieferungen',
        beschreibung: 'Lieferung anlegen. Body: auftragsnummer, kunde_id, artikelnummer, menge. Braucht ein Token.',
        vorlage: {
          name: 'Lieferung anlegen',
          methode: 'POST',
          url: '/api/lieferungen',
          header: [['Content-Type', 'application/json'], ['Authorization', 'Bearer HIER_DEN_TOKEN_EINFUEGEN']],
          body: json({ auftragsnummer: 'AUF-…', kunde_id: 0, artikelnummer: 'A-…', menge: 0 }),
        },
      },
    ],
  },
  {
    titel: 'Spiel-Infrastruktur (nutzt die Spielseite selbst)',
    endpunkte: [
      { methode: 'GET', pfad: '/api/ereignisse', beschreibung: 'Live-Verbindung (Server-Sent Events): Der Server meldet Erfolge, Roboter-Bewegungen usw.' },
      { methode: 'GET', pfad: '/api/fortschritt', beschreibung: 'Deine Erfolge und gesammelten Statuscodes.' },
      { methode: 'POST', pfad: '/api/pruefen', beschreibung: 'Prüft Antworten auf Aufgaben.' },
      { methode: 'GET', pfad: '/api/entwicklerportal', beschreibung: 'Dein persönlicher API-Key.' },
    ],
  },
];

export const VORLAGEN = GRUPPEN.map((gr) => ({
  titel: gr.titel,
  vorlagen: gr.endpunkte.filter((e) => e.vorlage).map((e) => e.vorlage),
})).filter((gr) => gr.vorlagen.length);

export function findeVorlage(name) {
  for (const gr of VORLAGEN) {
    const v = gr.vorlagen.find((x) => x.name === name);
    if (v) return v;
  }
  return null;
}
