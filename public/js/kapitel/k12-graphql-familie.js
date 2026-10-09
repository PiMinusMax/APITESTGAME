import { code, g, job, merke, neugierig } from '../ui.js';
import { findeVorlage } from '../daten/endpunkte.js';

const FAMILIE = [
  { icon: '🌐', name: 'REST', text: 'HTTP + meist JSON, eine Adresse pro Ressource.', wo: 'Web, Apps, Cloud – die häufigste Art' },
  { icon: '🧼', name: 'SOAP', text: 'XML im Umschlag, strenger Vertrag (WSDL).', wo: 'Banken, Versicherungen, Behörden, ERP' },
  { icon: '🔷', name: 'GraphQL', text: 'Eine Adresse, der Client bestimmt die Felder.', wo: 'Moderne Web- und Handy-Apps' },
  { icon: '⚡', name: 'gRPC', text: 'Sehr schnell, binär (kein lesbarer Text), mit festem Vertrag.', wo: 'Zwischen Microservices innerhalb einer Firma' },
  { icon: '🔔', name: 'Webhooks', text: '„Ruf nicht ständig an – wir melden uns!“ Der Server ruft DEINE Adresse auf, wenn etwas passiert.', wo: 'Zahlung eingegangen, Paket zugestellt, neuer Auftrag' },
  { icon: '📡', name: 'WebSockets & SSE', text: 'Eine Verbindung bleibt offen, Daten kommen live.', wo: 'Chats, Börsenkurse, Live-Dashboards – und diese Seite!' },
  { icon: '📬', name: 'Message Queues', text: 'Ein „Briefkasten“ zwischen Systemen: Nachrichten warten, bis der Empfänger sie abholt.', wo: 'Entkoppelte Systeme, z. B. mit RabbitMQ, Apache Kafka, IBM MQ' },
  { icon: '📁', name: 'Dateischnittstellen', text: 'CSV- oder XML-Dateien werden regelmäßig abgelegt und abgeholt, oft per SFTP.', wo: 'Nächtliche Datenabgleiche – immer noch sehr häufig' },
  { icon: '🏭', name: 'EDI', text: 'Genormte Geschäftsdokumente zwischen Firmen, z. B. EDIFACT.', wo: 'Handel, Logistik, Automobil: Bestellungen, Lieferscheine, Rechnungen' },
  { icon: '📊', name: 'OData', text: 'REST mit eingebauter Abfragesprache (Filtern, Sortieren per URL).', wo: 'SAP- und Microsoft-Umgebungen' },
];

export default {
  id: 'graphql-familie',
  icon: '🧩',
  titel: 'GraphQL und die große Schnittstellen-Familie',
  untertitel: 'Was es außer REST und SOAP noch gibt – und wann man was benutzt.',
  ziele: [
    'GraphQL verstehen und selbst Abfragen schreiben',
    'Weitere Schnittstellen-Arten kennen: Webhooks, Live-Verbindungen, Queues, Dateien, EDI',
    'Live-Daten (Server-Sent Events) in den DevTools beobachten',
    'Für eine Situation die passende Schnittstellen-Art wählen',
  ],
  merksaetze: [
    '<strong>GraphQL</strong>: eine Adresse, und der Client beschreibt genau, welche Felder er haben will.',
    'GraphQL antwortet oft mit <strong>200</strong>, auch wenn es Fehler gab – immer ins Feld <code>errors</code> schauen!',
    '<strong>Webhooks</strong> drehen die Richtung um: Der Server meldet sich bei dir, wenn etwas passiert.',
    '<strong>Message Queues</strong> entkoppeln Systeme – nichts geht verloren, wenn der Empfänger kurz offline ist.',
    'In Unternehmen laufen oft viele Arten gleichzeitig – auch Dateien und EDI.',
  ],
  schritte: [
    {
      typ: 'text',
      titel: 'GraphQL: bestell genau, was du willst',
      html: `
        <p>Stell dir vor, eine Handy-App braucht von jedem Kunden nur den <strong>Namen</strong>. Die REST-API liefert aber immer alles: Name, E-Mail, Stadt, Kunde seit … Zu viele Daten (<em>Over-Fetching</em>). Und für die Bestellungen braucht man noch eine zweite Anfrage pro Kunde (<em>Under-Fetching</em>).</p>
        <p>Dafür hat Facebook ${g('graphql', 'GraphQL')} erfunden (veröffentlicht 2015). Die Idee: Es gibt nur <strong>eine Adresse</strong> (meist <code>/graphql</code>), und der Client schickt eine Art <strong>Wunschzettel</strong>, welche Felder er haben möchte. Die Antwort hat genau dieselbe Form:</p>
        <div class="zwei-spalten">
          <div>${code('graphql', `{
  kunde(id: 4) {
    name
    stadt
    bestellungen {
      nummer
      gesamtbetrag
    }
  }
}`, { titel: 'Abfrage (Wunschzettel)', kopieren: false })}</div>
          <div>${code('json', `{
  "data": {
    "kunde": {
      "name": "Erika Mustermann",
      "stadt": "Köln",
      "bestellungen": [
        { "nummer": "B-1002", "gesamtbetrag": 34.9 },
        …
      ]
    }
  }
}`, { titel: 'Antwort', kopieren: false })}</div>
        </div>
        ${merke('REST ist wie ein Menü mit festen Tellern. GraphQL ist wie ein Buffet: Du stellst dir deinen Teller selbst zusammen – mit genau den Dingen, die du willst.')}
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k12-graphql',
      titel: 'Deine erste GraphQL-Abfrage',
      html: `
        <p>GraphQL-Anfragen sind ganz normale ${'<span class="methode methode-post">POST</span>'}-Anfragen an <code>/graphql</code>. Die Abfrage steht als <strong>Text</strong> im JSON-Feld <code>query</code>.</p>
        <p>Lade die Vorlage und schick sie ab. Füge danach das Feld <code>email</code> hinzu und schick sie noch einmal ab. Wie verändert sich die Antwort?</p>
      `,
      vorlage: findeVorlage('GraphQL-Abfrage'),
      pruefung: { art: 'erfolg', erfolg: 'graphql_anfrage' },
      tipps: ['Die Felder stehen einfach mit Leerzeichen getrennt in den geschweiften Klammern: <code>{ kunden { name stadt email } }</code>'],
      danach: `
        <p>Du bekommst genau die Felder, die du bestellst – nicht mehr und nicht weniger.</p>
        ${neugierig('<p>Welche Felder es gibt, verrät das <strong>Schema</strong>. Öffne <a href="/graphql" target="_blank" rel="noopener">/graphql</a> im Browser – dort siehst du alle Typen (Kunde, Bestellung, Produkt …) und ihre Felder.</p>')}
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k12-graphql-frage',
      titel: 'Gezielt nachfragen',
      html: `
        <p>Schreib eine Abfrage für den Kunden mit der <code>id</code> <strong>3</strong>: seinen Namen und die Nummern seiner Bestellungen. <strong>Wie viele Bestellungen hat er?</strong></p>
        ${code('graphql', '{ kunde(id: 3) { name bestellungen { nummer } } }', { titel: 'So könnte deine Abfrage aussehen' })}
        <p>Probier danach ruhig auch einen Fehler aus: Frag ein Feld ab, das es nicht gibt, z. B. <code>telefon</code>. Achte auf den Statuscode!</p>
      `,
      vorlage: { ...findeVorlage('GraphQL-Abfrage'), body: JSON.stringify({ query: '{ kunde(id: 3) { name } }' }, null, 2) },
      pruefung: { art: 'antwort', server: 'graphql_bestellungen', platzhalter: 'Anzahl' },
      danach: `
        ${merke('Bei einem unbekannten Feld war der Statuscode trotzdem <strong>200</strong> – der Fehler stand im Feld <code>errors</code>. Das ist typisch für GraphQL. Prüfe bei GraphQL also <strong>immer</strong>, ob es ein <code>errors</code>-Feld gibt!')}
      `,
    },
    {
      typ: 'text',
      titel: 'Die große Schnittstellen-Familie',
      html: `
        <p>REST, SOAP und GraphQL sind nicht die einzigen Arten, wie Systeme miteinander reden. Im Unternehmensalltag begegnen dir viele weitere:</p>
        <div class="karten-gitter">
          ${FAMILIE.map((f) => `<div class="familie-karte"><h4>${f.icon} ${f.name}</h4><p>${f.text}</p><div class="wo">📍 ${f.wo}</div></div>`).join('')}
        </div>
        <h3>Abfragen oder benachrichtigt werden?</h3>
        <p>Ein wichtiger Unterschied: Beim <strong>Polling</strong> fragt der Client immer wieder nach („Ist die Zahlung schon da? … Und jetzt? … Und jetzt?“) – wie ein Kind auf dem Rücksitz: „Sind wir bald da?“. Mit ${g('webhook', 'Webhooks')}, ${g('websocket', 'WebSockets')} oder ${g('sse', 'Server-Sent Events')} meldet sich die andere Seite von selbst, sobald etwas passiert. Das spart viele unnötige Anfragen.</p>
        ${job(`In vielen Firmen laufen Schnittstellen nicht direkt von System zu System, sondern über eine ${g('middleware', 'Integrationsplattform')} (auch Middleware oder iPaaS genannt). Bekannte Beispiele sind SAP Integration Suite, MuleSoft, Microsoft Azure Integration Services oder Boomi. Sie wandeln Formate um (z. B. XML → JSON), verteilen Nachrichten und überwachen, ob alles ankommt.`)}
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k12-sse',
      titel: 'Live-Daten in den DevTools entdecken',
      html: `
        <p>Weißt du noch, wie Bit sich sofort bewegt hat, als du ihn aus der Konsole gesteuert hast? Das war eine <strong>Live-Verbindung</strong>: Die Seite hält eine Anfrage an <code>/api/ereignisse</code> dauerhaft offen, und der Server schickt über ${g('sse', 'Server-Sent Events')} Neuigkeiten.</p>
        <ol>
          <li>Öffne den <strong>Netzwerk-Tab</strong> und lade die Seite neu (sonst ist die Verbindung nicht aufgezeichnet).</li>
          <li>Suche die Zeile <code>ereignisse</code> (Typ <code>eventsource</code>) und klicke darauf.</li>
          <li>Öffne den Reiter <strong>EventStream</strong> (Chrome/Edge) bzw. <strong>Antwort</strong> (Firefox).</li>
          <li>Bewege jetzt Bit aus der Konsole – und schau, was im EventStream erscheint.</li>
        </ol>
        ${code('js', `await fetch("/api/roboter/bewegen", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ richtung: "unten" })
});`)}
        <p><strong>Frage:</strong> Welchen Ereignis-<strong>Typ</strong> (Spalte „Type“ / „Typ“) hat das Ereignis mit dem neuen Zustand des Roboters?</p>
      `,
      pruefung: { art: 'antwort', lokal: ['roboter'], platzhalter: 'Ereignis-Typ', falsch: 'Nicht ganz. Es erscheinen mehrere Ereignisse – gesucht ist das mit Bits neuer Position.' },
      tipps: [
        'Die Zeile heißt <code>ereignisse</code>. Mit dem Suchfeld (Filter) im Netzwerk-Tab findest du sie schnell.',
        'Neben dem gesuchten Typ erscheinen noch andere, z. B. <code>anfrage</code> oder <code>statuscode</code>.',
      ],
      danach: '<p>Genau – <code>roboter</code>. Daneben siehst du <code>anfrage</code> (für das Server-Protokoll), <code>erfolg</code> und <code>statuscode</code>. So weiß diese Seite immer sofort, was du gerade tust. 📡</p>',
    },
    {
      typ: 'aufgabe',
      id: 'k12-echt',
      titel: 'Bonus: Eine echte, öffentliche API',
      optional: true,
      html: `
        <p>Zum Abschluss verlässt du die Übungswelt: <strong>Open-Meteo</strong> ist ein echter, kostenloser Wetterdienst mit offener API – ganz ohne Anmeldung. Tippe in die Konsole:</p>
        ${code('js', `const wetter = await fetch("https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m");
await wetter.json()`)}
        <p>Das sind die echten Werte für Berlin (52,52° N, 13,41° O). Schau im Netzwerk-Tab: Die Anfrage geht an einen <strong>ganz anderen Server</strong>.</p>
      `,
      pruefung: { art: 'manuell', knopf: 'Hat geklappt' },
      xp: 15,
      danach: neugierig(`<p>Dass deine Seite Daten von einer <em>anderen</em> Domain holen darf, ist nicht selbstverständlich. Der Server muss es per ${g('cors', 'CORS')}-Header erlauben (<code>Access-Control-Allow-Origin</code>). Viele APIs erlauben das nicht – dann siehst du in der Konsole eine rote „CORS“-Fehlermeldung. Probier zum Vergleich: <code>await fetch("https://example.com")</code></p>`),
    },
    {
      typ: 'quiz',
      id: 'k12-quiz',
      intro: 'Welche Schnittstellen-Art passt am besten?',
      fragen: [
        {
          frage: 'Ein Zahlungsdienst soll deinen Shop <strong>sofort</strong> informieren, wenn eine Zahlung eingegangen ist.',
          antworten: [
            { text: 'Webhook', richtig: true },
            { text: 'Eine CSV-Datei, die nachts verschickt wird', warum: 'Dann wüsste der Shop erst am nächsten Morgen Bescheid.' },
            { text: 'Der Shop fragt jede Sekunde nach (Polling)', warum: 'Geht, ist aber verschwenderisch. Webhooks sind genau dafür gemacht.' },
          ],
        },
        {
          frage: 'Eine Versicherung bietet einen streng definierten XML-Dienst mit WSDL an.',
          antworten: [{ text: 'SOAP', richtig: true }, { text: 'GraphQL', warum: 'GraphQL nutzt kein WSDL und meist JSON.' }, { text: 'WebSocket', warum: 'WebSockets sind für Live-Verbindungen.' }],
        },
        {
          frage: 'Eine Handy-App braucht mit <strong>einer</strong> Anfrage genau drei Felder aus verschiedenen Daten.',
          antworten: [{ text: 'GraphQL', richtig: true }, { text: 'EDI', warum: 'EDI ist für genormte Geschäftsdokumente zwischen Firmen.' }, { text: 'Dateischnittstelle', warum: 'Viel zu langsam für eine App.' }],
        },
        {
          frage: 'Ein Händler schickt jede Nacht alle neuen Preise an seinen Lieferanten.',
          antworten: [
            { text: 'Dateischnittstelle (z. B. CSV über SFTP)', richtig: true },
            { text: 'WebSocket', warum: 'Für einen nächtlichen Abgleich braucht man keine Live-Verbindung.' },
            { text: 'GraphQL', warum: 'Möglich, aber für große nächtliche Abgleiche sind Dateien typisch.' },
          ],
        },
        {
          frage: 'Ein Chat soll neue Nachrichten sofort anzeigen.',
          antworten: [{ text: 'WebSocket', richtig: true }, { text: 'SOAP', warum: 'SOAP ist Anfrage-Antwort – nicht live.' }, { text: 'Dateischnittstelle', warum: 'Viel zu langsam für einen Chat.' }],
        },
        {
          frage: 'Wenn das Lagersystem kurz offline ist, dürfen keine Bestellungen verloren gehen.',
          antworten: [
            { text: 'Message Queue', richtig: true },
            { text: 'Direkter REST-Aufruf ohne Wiederholung', warum: 'Ist das Lager offline, schlägt der Aufruf fehl.' },
            { text: 'Webhook ohne Wiederholung', warum: 'Auch hier ginge die Nachricht verloren, wenn niemand antwortet.' },
          ],
          erklaerung: 'Die Queue hält die Nachrichten fest, bis das Lager wieder da ist.',
        },
      ],
    },
  ],
};
