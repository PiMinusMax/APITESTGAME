import { code, job, merke } from '../ui.js';
import { findeVorlage, soapUmschlag } from '../daten/endpunkte.js';

export default {
  id: 'abschluss',
  icon: '🏆',
  titel: 'Abschlussmission: Dein erster Integrationsauftrag',
  untertitel: 'Alles, was du gelernt hast – in einem echten Ablauf.',
  ziele: [
    'Eine Aufgabe aus mehreren Schnittstellen zusammensetzen: REST, SOAP und Token',
    'Die Doku (API-Handbuch) als Werkzeug nutzen',
    'Fehlermeldungen selbstständig lesen und beheben',
  ],
  merksaetze: [
    'Echte Integrationen bestehen aus mehreren Schritten über verschiedene Systeme.',
    'Doku lesen, Schritt für Schritt vorgehen, jede Antwort prüfen.',
    'Fehlermeldungen sind deine Freunde: Sie sagen dir genau, was als Nächstes zu tun ist.',
  ],
  schritte: [
    {
      typ: 'text',
      titel: 'Das Briefing',
      html: `
        <p>Herzlichen Glückwunsch zu deiner ersten Woche im <strong>Integrationsteam</strong> unseres Übungs-Shops! 🎉 Heute bekommst du deinen ersten echten Auftrag:</p>
        <blockquote class="box box-job">
          „Ein Kunde hat bestellt. Bitte prüfe, ob die Ware auf Lager ist, und gib die Lieferung frei. Die Details findest du im Auftragssystem. – Deine Teamleitung“
        </blockquote>
        <p>Dafür musst du mit <strong>drei Systemen</strong> sprechen:</p>
        <div class="systemkette">
          <div class="system"><b>📋</b>Auftragssystem<br><small>REST + Token</small></div><span class="pfeil">→</span>
          <div class="system"><b>📦</b>Lagerdienst<br><small>SOAP</small></div><span class="pfeil">→</span>
          <div class="system"><b>🚚</b>Versandsystem<br><small>REST + Token</small></div>
        </div>
        <p>Du darfst jedes Werkzeug benutzen: Werkstatt, Konsole, curl. Schau ins <a href="#/handbuch">📘 API-Handbuch</a>, wenn du nicht weiterweißt. Und: Lies jede Antwort genau – auch die Fehler!</p>
        ${merke('Tokens laufen nach 15 Minuten ab. Bekommst du „Token abgelaufen“, melde dich einfach neu an (<code>POST /api/login</code>).')}
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k13-mission',
      titel: 'Der Auftrag',
      html: `
        <p>Arbeite die Schritte nacheinander ab. Die Checkliste hakt sich automatisch ab, sobald der Server deinen Erfolg bemerkt.</p>
        <ol>
          <li><strong>Anmelden</strong> und Token holen (wie in Kapitel 8).</li>
          <li><strong>Auftrag abholen:</strong> <code>GET /api/auftrag</code> – mit Token. Lies die Antwort genau: Welcher Kunde, welcher Artikel, wie viele Stück?</li>
          <li><strong>Lager prüfen:</strong> Frag beim SOAP-Lagerdienst den Bestand <em>genau dieses Artikels</em> ab. Ist genug da?</li>
          <li><strong>Lieferung anlegen:</strong> <code>POST /api/lieferungen</code> mit Token und einem JSON-Body mit <code>auftragsnummer</code>, <code>kunde_id</code>, <code>artikelnummer</code> und <code>menge</code> – alles passend zum Auftrag.</li>
        </ol>
      `,
      vorlagen: [
        { text: '🧰 1 · Login', vorlage: findeVorlage('Login') },
        { text: '🧰 2 · Auftrag holen', vorlage: findeVorlage('Auftrag holen') },
        { text: '🧰 3 · SOAP-Lager', vorlage: { ...findeVorlage('SOAP: Lagerbestand abfragen'), body: soapUmschlag('A-…') } },
        { text: '🧰 4 · Lieferung anlegen', vorlage: findeVorlage('Lieferung anlegen') },
      ],
      pruefung: {
        art: 'teilziele',
        ziele: [
          { erfolg: 'auftrag_erhalten', text: 'Auftrag abgeholt (<code>GET /api/auftrag</code>)', kurz: 'Auftrag abgeholt', xp: 20 },
          { erfolg: 'auftrag_lager_geprueft', text: 'Lagerbestand des Auftrags-Artikels per SOAP geprüft', kurz: 'Lager geprüft', xp: 30 },
          { erfolg: 'auftrag_abgeschlossen', text: 'Lieferung angelegt (<code>POST /api/lieferungen</code> → 201)', kurz: 'Lieferung angelegt', xp: 50 },
        ],
      },
      xp: 50,
      tipps: [
        'Bekommst du 401? Dann fehlt das Token oder es ist abgelaufen. Header: <code>Authorization: Bearer &lt;token&gt;</code>',
        'Für die SOAP-Abfrage brauchst du die <code>artikelnummer</code> aus dem Auftrag – nicht irgendeine.',
        'Bekommst du 409 „Lagerbestand nicht geprüft“? Dann hast du beim SOAP-Dienst nach einem anderen Artikel gefragt als im Auftrag steht.',
        'Bekommst du 422? Lies <code>details</code>: Dort steht für jedes Feld, was nicht passt. Achtung bei Zahlen: <code>"menge": 3</code> – ohne Anführungszeichen!',
      ],
      loesung: `
        <p>So könnte es in der Konsole aussehen (Token, Artikel und Werte aus deinem Auftrag einsetzen):</p>
        ${code('js', `// 1. Login
const login = await (await fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ benutzername: "azubi", passwort: "schnittstelle" })
})).json();
const token = login.token;

// 2. Auftrag holen
const auftrag = await (await fetch("/api/auftrag", {
  headers: { Authorization: "Bearer " + token }
})).json();
console.log(auftrag);

// 3. Lager prüfen (SOAP)
await (await fetch("/soap/lager", {
  method: "POST",
  headers: { "Content-Type": "text/xml; charset=utf-8" },
  body: \`<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:lag="urn:mission-schnittstelle:lager">
  <soap:Body>
    <lag:LagerbestandAbfragen>
      <lag:artikelnummer>\${auftrag.artikelnummer}</lag:artikelnummer>
    </lag:LagerbestandAbfragen>
  </soap:Body>
</soap:Envelope>\`
})).text();

// 4. Lieferung anlegen
await (await fetch("/api/lieferungen", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
  body: JSON.stringify({
    auftragsnummer: auftrag.auftragsnummer,
    kunde_id: auftrag.kunde.id,
    artikelnummer: auftrag.artikelnummer,
    menge: auftrag.menge
  })
})).json();`)}
      `,
      danach: `
        <p>🎉 <strong>Auftrag erledigt!</strong> Du hast gerade drei Systeme miteinander verbunden: Auftrag gelesen (REST), Lager geprüft (SOAP) und eine Lieferung angelegt (REST) – abgesichert mit einem Token. Genau so sehen Integrationen im echten Leben aus, nur dass dort ein Programm diese Schritte automatisch und tausendfach ausführt.</p>
        <p>Probier zum Spaß, die Lieferung noch einmal anzulegen. Was sagt der Server? Richtig: <strong>409</strong> – doppelte Lieferungen wären teuer!</p>
      `,
    },
    {
      typ: 'quiz',
      id: 'k13-quiz',
      intro: 'Das große Abschluss-Quiz – einmal quer durch alles.',
      fragen: [
        {
          frage: 'Eine Anfrage gibt 401 zurück. Was prüfst du zuerst?',
          antworten: [
            { text: 'Ob Token oder API-Key fehlen oder abgelaufen sind', richtig: true },
            { text: 'Ob der Server abgestürzt ist', warum: 'Das wäre eher ein 5xx-Fehler.' },
            { text: 'Ob die Adresse zu lang ist', warum: '401 hat mit der Anmeldung zu tun.' },
          ],
        },
        {
          frage: 'Welche Methode passt, um eine Lieferung neu anzulegen?',
          antworten: [{ text: 'POST', richtig: true }, { text: 'GET', warum: 'GET liest nur.' }, { text: 'DELETE', warum: 'DELETE löscht.' }],
        },
        {
          frage: 'Ein SOAP-Dienst antwortet mit HTTP 500. Was steckt dahinter?',
          antworten: [
            { text: 'Ein SOAP-Fault – die Details stehen im Body', richtig: true },
            { text: 'Immer ein Absturz des Servers', warum: 'Bei SOAP kann 500 auch heißen, dass deine Anfrage fehlerhaft war. Lies den Fault!' },
            { text: 'Alles hat geklappt', warum: '5xx ist nie ein Erfolg.' },
          ],
        },
        {
          frage: 'Wo siehst du im Browser, welche Daten eine Webseite wirklich mit dem Server austauscht?',
          antworten: [
            { text: 'In den DevTools im Netzwerk-Tab', richtig: true },
            { text: 'In den Druckeinstellungen', warum: '😄 Nein.' },
            { text: 'Gar nicht, das ist geheim', warum: 'Doch – alles, was dein Browser schickt und bekommt, kannst du dir ansehen.' },
          ],
        },
        {
          frage: 'Was gehört in eine gute Fehlermeldung an ein anderes Team?',
          antworten: [
            { text: 'Zeitpunkt, Methode + Adresse, Statuscode, Fehlermeldung und Anfrage-ID', richtig: true },
            { text: '„Geht nicht.“', warum: 'Damit kann niemand etwas anfangen.' },
            { text: 'Dein Passwort, damit sie es selbst testen können', warum: 'Niemals! Zugangsdaten werden nicht weitergegeben.' },
          ],
        },
      ],
    },
    {
      typ: 'text',
      titel: 'Wie geht es weiter?',
      html: `
        <p>Du hast in diesem Spiel eine Menge gelernt – mehr, als viele am ersten Tag wissen. Hier ein paar Ideen für die nächsten Schritte:</p>
        <ul>
          <li>🧰 <strong>Postman</strong> oder <strong>Bruno</strong> installieren und Anfragen in Sammlungen speichern</li>
          <li>📘 Eine echte <strong>OpenAPI</strong>-Doku lesen, z. B. bei einem öffentlichen Dienst</li>
          <li>🧪 <strong>curl</strong> im Terminal üben</li>
          <li>📐 <strong>JSON Schema</strong> und <strong>XML Schema (XSD)</strong> kennenlernen – damit prüft man Daten automatisch</li>
          <li>🗄️ Grundlagen von <strong>SQL</strong> und Datenbanken – irgendwo müssen die Daten ja liegen</li>
          <li>🔄 Wie <strong>Integrationsplattformen</strong> Daten umwandeln (Mapping)</li>
          <li>📈 <strong>Logging und Monitoring</strong>: Wie merkt man, dass eine Schnittstelle nachts ausgefallen ist?</li>
        </ul>
        ${job('Das Wichtigste im Schnittstellen-Bereich ist nicht, alles auswendig zu wissen. Es ist die Haltung: neugierig sein, Doku lesen, Anfrage und Antwort genau anschauen – und nicht aufgeben, wenn etwas rot wird. Das kannst du jetzt. 💪')}
      `,
    },
  ],
};
