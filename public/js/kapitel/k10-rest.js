import { code, g, job, m, merke, neugierig, tabelle } from '../ui.js';
import { findeVorlage } from '../daten/endpunkte.js';

const OPENAPI = `openapi: 3.0.3
info:
  title: Übungs-Shop API
  version: 1.0.0
paths:
  /api/kunden/{id}:
    get:
      summary: Einen Kunden lesen
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Der Kunde
        "404":
          description: Kunde nicht gefunden`;

export default {
  id: 'rest',
  icon: '🌐',
  titel: 'REST: der Stil des Webs',
  untertitel: 'Die häufigste Art, Web-APIs zu bauen – und wie man darin Daten findet.',
  ziele: [
    'Die Grundideen von <strong>REST</strong> verstehen',
    'Gute von schlechten API-Adressen unterscheiden',
    'Filter, Sortierung und Seiten (Paginierung) nutzen',
    'In verknüpften Daten wie ein Detektiv suchen',
  ],
  merksaetze: [
    'Bei REST ist alles eine <strong>Ressource</strong> mit eigener Adresse – Adressen sind Substantive, Methoden die Verben.',
    'REST ist <strong>zustandslos</strong>: Jede Anfrage bringt alles mit, was der Server braucht.',
    'Große Listen kommen <strong>seitenweise</strong> (Paginierung). Gesamtzahl und nächste Seite stehen meist in „meta“ und „links“.',
    '<strong>OpenAPI</strong> (früher Swagger) ist der Standard, um REST-APIs zu beschreiben.',
  ],
  schritte: [
    {
      typ: 'text',
      titel: 'Was ist REST?',
      html: `
        <p>${g('rest', 'REST')} steht für <em>Representational State Transfer</em>. Klingt kompliziert – ist aber nur ein <strong>Bauplan</strong> (ein „Architekturstil“) dafür, wie man Web-APIs ordentlich gestaltet. Die meisten APIs, mit denen du arbeiten wirst, sind REST-APIs. Die API dieses Spiels übrigens auch!</p>
        <h3>Die Grundideen</h3>
        <ol>
          <li><strong>Alles ist eine ${g('ressource', 'Ressource')}</strong> mit eigener Adresse: Kunden, Bestellungen, Notizen.</li>
          <li><strong>Adressen sind Substantive, Methoden sind Verben.</strong> Nicht <code>/holeKunde</code>, sondern ${m('GET')} <code>/kunden/4</code>.</li>
          <li><strong>Zustandslos:</strong> Der Server merkt sich zwischen zwei Anfragen nichts über dich. Jede Anfrage bringt alles mit (zum Beispiel das Token). Wie ein Kellner, der jedes Mal neu fragt, an welchem Tisch du sitzt – dafür kann jeder Kellner dich bedienen.</li>
          <li><strong>Standards nutzen:</strong> HTTP-Methoden, Statuscodes und meist JSON.</li>
          <li><strong>Verknüpfungen:</strong> Ressourcen verweisen aufeinander, z. B. <code>/kunden/4/bestellungen</code>.</li>
        </ol>
        <h3>So sieht das typischerweise aus</h3>
        ${tabelle(
          ['Anfrage', 'Bedeutung'],
          [
            [`${m('GET')} <code>/api/kunden</code>`, 'Liste aller Kunden (die „Sammlung“)'],
            [`${m('GET')} <code>/api/kunden/4</code>`, 'Ein bestimmter Kunde (ein „Element“)'],
            [`${m('POST')} <code>/api/kunden</code>`, 'Neuen Kunden anlegen'],
            [`${m('PUT')} / ${m('PATCH')} <code>/api/kunden/4</code>`, 'Kunde 4 ändern'],
            [`${m('DELETE')} <code>/api/kunden/4</code>`, 'Kunde 4 löschen'],
            [`${m('GET')} <code>/api/kunden/4/bestellungen</code>`, 'Alle Bestellungen von Kunde 4'],
          ],
        )}
      `,
    },
    {
      typ: 'quiz',
      id: 'k10-design',
      intro: 'Du bist jetzt API-Designer:in. Welche Adresse passt am besten zu REST?',
      fragen: [
        {
          frage: 'Kunde Nummer 4 lesen:',
          antworten: [
            { text: '<code>GET /api/kunden/4</code>', richtig: true },
            { text: '<code>GET /api/holeKunde?id=4</code>', warum: 'Das Verb steckt in der Adresse – bei REST übernimmt das die Methode GET.' },
            { text: '<code>POST /api/kunde-lesen</code>', warum: 'Zum Lesen nimmt man GET, und die Adresse sollte ein Substantiv sein.' },
          ],
        },
        {
          frage: 'Kunde Nummer 4 löschen:',
          antworten: [
            { text: '<code>DELETE /api/kunden/4</code>', richtig: true },
            { text: '<code>GET /api/kunden/4/loeschen</code>', warum: 'Gefährlich! GET darf nie etwas verändern – sonst löscht ein Link-Vorschau-Programm aus Versehen Kunden.' },
            { text: '<code>POST /api/loescheKunde</code>', warum: 'Funktioniert vielleicht, ist aber kein REST-Stil.' },
          ],
        },
        {
          frage: 'Alle Bestellungen von Kunde 4:',
          antworten: [
            { text: '<code>GET /api/kunden/4/bestellungen</code>', richtig: true },
            { text: '<code>GET /api/alleBestellungenVonKunde4</code>', warum: 'Zu speziell – für jeden Kunden bräuchte man eine eigene Adresse.' },
            { text: '<code>POST /api/bestellungen/suchen</code>', warum: 'Zum Lesen nimmt man GET.' },
          ],
        },
        {
          frage: 'Was bedeutet „zustandslos“?',
          antworten: [
            { text: 'Jede Anfrage enthält alle Infos, die der Server braucht', richtig: true },
            { text: 'Der Server hat keine Daten gespeichert', warum: 'Doch, Daten hat er. Er merkt sich nur nichts über das laufende „Gespräch“.' },
            { text: 'Die API hat keine Statuscodes', warum: 'Statuscodes sind bei REST sogar sehr wichtig.' },
          ],
        },
      ],
    },
    {
      typ: 'text',
      titel: 'Filtern, sortieren, blättern',
      html: `
        <p>Unser Übungs-Shop hat Kundendaten unter <code>/api/kunden</code>. Bei echten Systemen sind das schnell Millionen Einträge – die schickt kein Server auf einmal. Stattdessen gibt es Query-Parameter:</p>
        ${tabelle(
          ['Parameter', 'Beispiel', 'Wirkung'],
          [
            ['Filter', '<code>?stadt=Hamburg</code>', 'Nur Kunden aus Hamburg'],
            ['Suche', '<code>?name=Muster</code>', 'Nur Kunden, deren Name „Muster“ enthält'],
            ['Sortierung', '<code>?sortierung=name</code> / <code>-name</code>', 'Nach Name auf- bzw. absteigend'],
            ['Seite', '<code>?seite=2&amp;limit=5</code>', 'Die zweite Seite mit je 5 Einträgen'],
          ],
        )}
        <p>Diese Aufteilung in Seiten heißt ${g('paginierung', 'Paginierung')}. Eine Antwort sieht dann ungefähr so aus:</p>
        ${code('json', `{
  "daten": [ { "id": 1, "name": "Max Mustermann", … }, … ],
  "meta": { "gesamt": 12, "seite": 1, "limit": 5, "seiten": 3 },
  "links": {
    "naechste": "/api/kunden?seite=2&limit=5",
    "vorherige": null
  }
}`, { kopieren: false })}
        ${merke('Schau bei Listen immer, ob es weitere Seiten gibt! Ein häufiger Fehler: Jemand verarbeitet nur die erste Seite und wundert sich, dass Daten fehlen.')}
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k10-detektiv',
      titel: 'Detektiv-Auftrag: Die teure Bestellung',
      html: `
        <p>☎️ Die Hotline meldet: Die Kundin <strong>Erika Mustermann</strong> beschwert sich, ihre <strong>neueste</strong> Bestellung sei viel zu teuer gewesen.</p>
        <p><strong>Deine Aufgabe:</strong> Finde heraus, wie hoch der <strong>Gesamtbetrag</strong> dieser Bestellung war. Nutze Werkstatt, Konsole oder Adressleiste – ganz wie du magst.</p>
      `,
      vorlagen: [
        { text: '🧰 Kunden-Liste öffnen', vorlage: findeVorlage('Kunden auflisten') },
        { text: '🧰 Bestellungen eines Kunden', vorlage: findeVorlage('Bestellungen eines Kunden') },
      ],
      pruefung: { art: 'antwort', server: 'bestellbetrag', platzhalter: 'Betrag in Euro, z. B. 12,34' },
      xp: 30,
      tipps: [
        'Schritt 1: Finde Erikas Kundennummer (<code>id</code>). Tipp: <code>/api/kunden?name=Mustermann</code> – aber Vorsicht, es gibt zwei Mustermanns!',
        'Schritt 2: Ihre Bestellungen findest du unter <code>/api/kunden/<em>ID</em>/bestellungen</code>.',
        'Schritt 3: Die Bestellungen sind nach Datum sortiert, die älteste zuerst. Du suchst den <code>gesamtbetrag</code> der neuesten.',
      ],
      danach: '<p>Fall gelöst! 🔎 So sieht echte Fehleranalyse aus: Man hangelt sich von Ressource zu Ressource, bis man die eine Information hat. In der Antwort standen übrigens <code>links</code> – die zeigen dir, wohin du als Nächstes schauen kannst.</p>',
    },
    {
      typ: 'aufgabe',
      id: 'k10-hamburg',
      titel: 'Wie viele Kunden kommen aus Hamburg?',
      html: '<p>Die Vertriebsleitung möchte wissen, wie viele Kunden in <strong>Hamburg</strong> wohnen. Nutze einen Filter!</p>',
      vorlage: { name: 'Kunden filtern', methode: 'GET', url: '/api/kunden?stadt=' },
      pruefung: { art: 'antwort', server: 'kunden_hamburg', platzhalter: 'Anzahl' },
      xp: 15,
      tipps: ['Häng <code>?stadt=Hamburg</code> an die Adresse. Die Gesamtzahl steht in <code>meta.gesamt</code> – die Liste selbst zeigt dir nur eine Seite.'],
    },
    {
      typ: 'text',
      titel: 'Die Speisekarte einer API: Dokumentation',
      html: `
        <p>Wie findest du heraus, welche Endpunkte eine API hat? In der <strong>Dokumentation</strong>! Für REST-APIs gibt es dafür einen Standard: ${g('openapi', 'OpenAPI')} (früher „Swagger“). Darin ist jede Adresse maschinenlesbar beschrieben:</p>
        ${code('yaml', OPENAPI, { titel: 'Ausschnitt einer OpenAPI-Beschreibung', kopieren: false })}
        <p>Aus so einer Datei erzeugen Werkzeuge automatisch hübsche Doku-Seiten zum Ausprobieren („Swagger UI“). Für dieses Spiel gibt es ein <a href="#/handbuch">📘 API-Handbuch</a> – schau mal rein!</p>
        <h3>Versionen</h3>
        <p>Viele Adressen enthalten eine Version, z. B. <code>/v1/</code> oder <code>/v2/</code>. Warum? Wenn sich die API grundlegend ändert, bekommt sie eine neue Version – und alle, die noch die alte nutzen, können in Ruhe umstellen. Der Vertrag aus Kapitel 1 bleibt so gültig. Erinnerst du dich an <code>/api/v1/hallo</code> mit der 301-Umleitung? Genau das.</p>
        ${job(`Werkzeuge, die dir im Job begegnen: ${g('postman', 'Postman')}, Insomnia oder Bruno (wie unsere Werkstatt, nur größer), ${g('curl', 'curl')} für die Kommandozeile, und Swagger UI zum Ausprobieren direkt in der Doku.`)}
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k10-curl',
      titel: 'Bonus: Eine Anfrage mit curl',
      optional: true,
      html: `
        <p><code>curl</code> ist ein Programm für die Kommandozeile, das auf Windows 10/11, macOS und Linux schon vorinstalliert ist. Öffne ein Terminal (Windows: „PowerShell“ oder „Eingabeaufforderung“, Mac: „Terminal“) und tippe:</p>
        ${code('bash', `curl -i "${location.origin}/api/kunden/4"`)}
        <p><code>-i</code> zeigt dir zusätzlich die Antwort-Header. Unter Windows-PowerShell schreibst du <code>curl.exe</code> statt <code>curl</code>.</p>
        <p>Die Werkstatt erzeugt dir jeden Request auch als curl-Befehl (Reiter „Als Code“) – inklusive deiner Spieler-ID im Header <code>X-Spieler-ID</code>, damit der Server dich erkennt.</p>
      `,
      pruefung: { art: 'manuell', knopf: 'Hat geklappt' },
      xp: 15,
      danach: neugierig('<p>Im Server-Protokoll der Werkstatt erscheint eine curl-Anfrage als „🛠️ externes Werkzeug“ – der Server erkennt das daran, dass curl keine typischen Browser-Header mitschickt.</p>'),
    },
    {
      typ: 'quiz',
      id: 'k10-quiz',
      fragen: [
        {
          frage: 'Warum liefert <code>/api/kunden</code> nicht alle Kunden auf einmal?',
          antworten: [
            { text: 'Wegen Paginierung: Große Datenmengen kommen seitenweise', richtig: true },
            { text: 'Weil die anderen Kunden geheim sind', warum: 'Nein, sie stehen auf den nächsten Seiten.' },
            { text: 'Weil die API kaputt ist', warum: 'Das ist Absicht – und ganz normal.' },
          ],
        },
        {
          frage: 'Was ist OpenAPI?',
          antworten: [
            { text: 'Ein Standard, um REST-APIs maschinenlesbar zu beschreiben', richtig: true },
            { text: 'Eine API, die jeder ohne Anmeldung nutzen darf', warum: 'Verwechslungsgefahr! Das wäre eine „öffentliche“ API.' },
            { text: 'Ein Programmierwerkzeug von Google', warum: 'Nein, OpenAPI ist ein offener Standard.' },
          ],
        },
        {
          frage: 'Warum haben APIs oft Versionen wie <code>/v1/</code> und <code>/v2/</code>?',
          antworten: [
            { text: 'Damit bestehende Nutzer nicht kaputtgehen, wenn sich die API ändert', richtig: true },
            { text: 'Weil v2 immer doppelt so schnell ist', warum: '😄 Nein, es geht um den Vertrag.' },
            { text: 'Das hat keinen Grund', warum: 'Doch – es schützt alle, die die API schon benutzen.' },
          ],
        },
      ],
    },
  ],
};
