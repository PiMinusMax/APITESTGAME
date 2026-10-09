import { achtung, code, g, job, m, merke, neugierig, tabelle } from '../ui.js';
import { entwicklerportal } from '../komponenten/entwicklerportal.js';
import { findeVorlage } from '../daten/endpunkte.js';

export default {
  id: 'header-auth',
  icon: '🔑',
  titel: 'Header und Anmeldung',
  untertitel: 'Zusatzinfos auf dem Umschlag – und wie APIs wissen, wer du bist.',
  ziele: [
    'Die wichtigsten Header kennen und selbst setzen',
    'Authentifizierung und Autorisierung unterscheiden',
    'Mit <strong>API-Key</strong> und <strong>Token</strong> geschützte Endpunkte nutzen',
    'Sicher mit Zugangsdaten umgehen',
  ],
  merksaetze: [
    'Header sind Zusatzinfos im Format <code>Name: Wert</code> – z. B. <code>Content-Type</code>, <code>Accept</code>, <code>Authorization</code>.',
    '<strong>Authentifizierung</strong> = Wer bist du? <strong>Autorisierung</strong> = Was darfst du?',
    '<strong>401</strong> = nicht angemeldet / unbekannt. <strong>403</strong> = bekannt, aber nicht berechtigt.',
    'Token schickt man als <code>Authorization: Bearer &lt;token&gt;</code>.',
    'Schlüssel, Tokens und Passwörter gehören nie in Chats, E-Mails, Tickets oder Screenshots.',
  ],
  schritte: [
    {
      typ: 'text',
      titel: 'Header: die Aufkleber auf dem Umschlag',
      html: `
        <p>Du kennst ${g('header', 'Header')} schon: Zusatzinfos im Format <code>Name: Wert</code>. Ein paar davon sind besonders wichtig:</p>
        ${tabelle(
          ['Header', 'Richtung', 'Wofür?'],
          [
            ['<code>Content-Type</code>', 'beide', 'In welchem Format ist der Body? z. B. <code>application/json</code>'],
            ['<code>Accept</code>', 'Anfrage', 'Welches Format hätte ich gern als Antwort?'],
            ['<code>Authorization</code>', 'Anfrage', 'Mein Ausweis: Token oder Zugangsdaten'],
            ['<code>User-Agent</code>', 'Anfrage', 'Welches Programm fragt? (setzt der Browser selbst)'],
            ['<code>Cookie</code> / <code>Set-Cookie</code>', 'Anfrage / Antwort', 'Datenzettel, die der Browser mitschickt bzw. bekommt'],
            ['<code>Location</code>', 'Antwort', 'Wo liegt das Neue bzw. wohin wurde umgezogen?'],
            ['<code>Retry-After</code>', 'Antwort', 'Wie lange soll ich warten?'],
          ],
        )}
        <p>Header, die mit <code>X-</code> beginnen, sind oft „selbst ausgedacht“ – z. B. unser <code>X-Anfrage-ID</code> oder <code>X-Quelle</code>.</p>
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k8-accept',
      titel: 'Bitte einmal als XML!',
      html: `
        <p>Mit dem Header ${g('accept', 'Accept')} kannst du dir das Antwortformat wünschen. Der Endpunkt <code>/api/hallo</code> kann JSON <em>und</em> XML.</p>
        <p><strong>Deine Aufgabe:</strong> Lade die Vorlage, ändere den Wert des Headers <code>Accept</code> auf <code>application/xml</code> und schick die Anfrage ab.</p>
      `,
      vorlage: findeVorlage('Hallo sagen'),
      pruefung: { art: 'erfolg', erfolg: 'accept_xml' },
      xp: 15,
      danach: '<p>Dieselben Daten, ein anderes Format! Das nennt man <strong>Content Negotiation</strong> – Client und Server „verhandeln“ das Format. Schau dir in den Antwort-Headern den <code>Content-Type</code> an.</p>',
    },
    {
      typ: 'text',
      titel: 'Wer bist du – und was darfst du?',
      html: `
        <p>Viele Daten sind nicht für alle bestimmt. Eine API muss deshalb zwei Fragen klären:</p>
        <div class="zwei-spalten">
          <div class="box box-merke" style="margin:0"><div class="box-titel">🪪 ${g('authentifizierung', 'Authentifizierung')}</div><strong>„Wer bist du?“</strong><br>Wie der Ausweis am Eingang.</div>
          <div class="box box-job" style="margin:0"><div class="box-titel">🎫 ${g('autorisierung', 'Autorisierung')}</div><strong>„Was darfst du?“</strong><br>Wie die Zugangskarte, die nur bestimmte Türen öffnet.</div>
        </div>
        <h3>Typische Verfahren</h3>
        <ul>
          <li><strong>${g('api-key', 'API-Key')}</strong> 🔑 – ein geheimer Schlüssel, meist in einem Header. Einfach: Wer ihn hat, kommt rein.</li>
          <li><strong>Benutzername + Passwort</strong> („Basic Auth“) – wird bei jeder Anfrage mitgeschickt. Nur codiert, nicht verschlüsselt – darum nur mit HTTPS!</li>
          <li><strong>${g('token', 'Token')}</strong> 🎟️ – du meldest dich <em>einmal</em> an und bekommst ein zeitlich begrenztes Token, wie ein Festival-Bändchen. Das zeigst du bei jeder Anfrage vor: <code>Authorization: Bearer &lt;token&gt;</code>. Das Standardverfahren dafür heißt ${g('oauth', 'OAuth 2.0')} – du kennst es von „Mit Google anmelden“.</li>
          <li><strong>Zertifikate</strong> 📜 – zwischen Firmen oft zusätzlich: Beide Seiten weisen sich mit digitalen Zertifikaten aus.</li>
        </ul>
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k8-tresor',
      titel: 'Den Tresor öffnen (API-Key)',
      html: `
        <p>Der Endpunkt <code>/api/tresor</code> ist verschlossen. Bei echten Anbietern bekommst du deinen Schlüssel in einem <strong>Entwicklerportal</strong>. Hier ist deiner:</p>
      `,
      render: (ziel) => entwicklerportal(ziel),
      vorlagen: [
        { text: '🧰 Tresor ohne Schlüssel versuchen', vorlage: { name: 'Tresor ohne Key', methode: 'GET', url: '/api/tresor' } },
        { text: '🧰 Tresor mit Schlüssel-Header', vorlage: findeVorlage('Tresor öffnen') },
      ],
      pruefung: { art: 'erfolg', erfolg: 'tresor_offen' },
      tipps: [
        'Probier es zuerst ohne Schlüssel – der Server antwortet mit 401 und sagt dir, was er erwartet.',
        'Der Header heißt <code>X-API-Key</code>. Ersetze in der Vorlage den Platzhalter durch deinen Schlüssel (er beginnt mit <code>key_</code>).',
      ],
      danach: `<p>Der Tresor ist offen! 💎 Probier zum Spaß, den Key in die Adresse zu schreiben (<code>/api/tresor?api_key=…</code>). Der Server lehnt ab – zu Recht: Adressen landen in Browserverläufen und Server-Logs. Schlüssel gehören in Header.</p>`,
    },
    {
      typ: 'aufgabe',
      id: 'k8-login',
      titel: 'Anmelden und Token holen',
      html: `
        <p>Jetzt meldest du dich an. Die Zugangsdaten für dieses Übungssystem:</p>
        <ul><li>Benutzername: <code>azubi</code></li><li>Passwort: <code>schnittstelle</code></li></ul>
        <p>Schick sie per ${m('POST')} an <code>/api/login</code>. In der Antwort bekommst du ein <strong>Token</strong>. Kopiere es dir – du brauchst es gleich!</p>
      `,
      vorlage: findeVorlage('Login'),
      pruefung: { art: 'erfolg', erfolg: 'login' },
      xp: 15,
      danach: '<p>Das Token ist ein langer Text mit zwei Punkten darin. Es ist 15 Minuten gültig. Danach musst du dich neu anmelden – das schützt, falls jemand ein Token in die Finger bekommt.</p>',
    },
    {
      typ: 'aufgabe',
      id: 'k8-profil',
      titel: 'Mit Token ins Profil',
      html: `
        <p>Nutze dein Token, um <code>/api/profil</code> abzurufen. Der Header muss genau so aussehen:</p>
        ${code('http', 'Authorization: Bearer eyJhbGciOi…dein-ganzes-Token…', { kopieren: false })}
        <p>Wichtig: erst das Wort <code>Bearer</code>, dann <strong>ein Leerzeichen</strong>, dann das Token.</p>
      `,
      vorlage: findeVorlage('Profil lesen'),
      pruefung: { art: 'erfolg', erfolg: 'profil_gelesen' },
      tipps: [
        'Kopiere das Token aus der Login-Antwort – ohne die Anführungszeichen drumherum.',
        'Bekommst du „Token abgelaufen“ oder „Token ungültig“? Dann melde dich einfach neu an und nimm das neue Token.',
      ],
      danach: `
        <p>Geschafft! Der Server hat dein Token geprüft und weiß jetzt, wer du bist.</p>
        ${neugierig(`<p>Dein Token ist ein ${g('jwt', 'JWT')} (JSON Web Token). Es besteht aus drei Teilen, getrennt durch Punkte: Kopf · Inhalt · Signatur. Der Inhalt ist nur <strong>codiert</strong>, nicht verschlüsselt – jeder kann ihn lesen! Probier es in der Konsole (Token einsetzen):</p>
          ${code('js', 'JSON.parse(atob("DEIN.TOKEN.HIER".split(".")[1]))')}
          <p>Die Signatur sorgt dafür, dass niemand den Inhalt unbemerkt ändern kann. Merke: <strong>Keine Geheimnisse in ein JWT packen.</strong></p>`)}
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k8-403',
      titel: 'Die verbotene Tür',
      html: `<p>Versuch mit deinem Token den Admin-Bereich <code>/api/admin</code> zu öffnen. Was sagt der Server?</p>`,
      vorlage: findeVorlage('Admin-Bereich'),
      pruefung: { art: 'erfolg', erfolg: 'admin_403' },
      xp: 15,
      danach: `
        <p><strong>403 Forbidden</strong>: Der Server weiß genau, wer du bist (dein Token ist gültig), aber als Azubi darfst du hier nicht rein.</p>
        ${merke('<strong>401</strong> = „Wer bist du? Ich kenne dich nicht.“ → Anmeldung fehlt oder ist ungültig.<br><strong>403</strong> = „Ich kenne dich – aber du darfst das nicht.“ → Berechtigung fehlt.')}
      `,
    },
    {
      typ: 'text',
      titel: 'Sicherheitsregeln für den Job',
      html: `
        ${achtung(`<ul>
          <li>🔐 <strong>Keys, Tokens und Passwörter sind wie Haustürschlüssel.</strong> Sie gehören nicht in E-Mails, Chats, Tickets, Screenshots oder in Programmcode, der in einem Repository liegt.</li>
          <li>📋 Vorsicht beim Kopieren aus den DevTools: „Als cURL kopieren“ nimmt Cookies und Tokens mit!</li>
          <li>🔒 Immer <strong>HTTPS</strong>.</li>
          <li>🧪 Unterscheide ${g('produktiv', 'Test- und Produktivsystem')}. Ausprobieren nur im Testsystem – im Produktivsystem ist jede Anfrage echt.</li>
          <li>👤 Echte Kundendaten sind durch die DSGVO geschützt. Nicht einfach herumschicken oder zum Testen benutzen.</li>
          <li>🚨 Ist ein Schlüssel doch einmal irgendwo gelandet, wo er nicht hingehört: sofort melden und austauschen lassen.</li>
        </ul>`, 'Goldene Regeln')}
        ${job('Viele Firmen nutzen einen Passwort-Tresor (Passwort-Manager) oder einen „Secret Store“, um Zugangsdaten sicher zu teilen. Frag in deinem Team, welcher Weg bei euch der richtige ist.')}
      `,
    },
    {
      typ: 'quiz',
      id: 'k8-quiz',
      fragen: [
        {
          frage: 'Welche Frage beantwortet die Authentifizierung?',
          antworten: [
            { text: 'Wer bist du?', richtig: true },
            { text: 'Was darfst du?', warum: 'Das ist die Autorisierung.' },
            { text: 'Wie spät ist es?', warum: '😄 Nein.' },
          ],
        },
        {
          frage: 'Wie schickt man ein Bearer-Token richtig mit?',
          antworten: [
            { text: '<code>Authorization: Bearer eyJ…</code>', richtig: true },
            { text: '<code>Token: eyJ…</code>', warum: 'Der Header heißt Authorization, und das Wort Bearer gehört davor.' },
            { text: 'In der Adresse: <code>?token=eyJ…</code>', warum: 'Adressen landen in Logs – Tokens gehören in den Header.' },
          ],
        },
        {
          frage: 'Du bist angemeldet, bekommst aber 403. Was bedeutet das?',
          antworten: [
            { text: 'Du hast keine Berechtigung für diese Aktion', richtig: true },
            { text: 'Dein Passwort ist falsch', warum: 'Das wäre 401 – hier kennt dich der Server ja schon.' },
            { text: 'Der Server ist kaputt', warum: 'Das wäre 5xx.' },
          ],
        },
        {
          frage: 'Ein Kollege bittet dich per Chat um den API-Key für das Produktivsystem. Was ist richtig?',
          antworten: [
            { text: 'Nicht im Chat schicken, sondern den offiziellen Weg nutzen (z. B. Passwort-Tresor oder eigener Zugang)', richtig: true },
            { text: 'Schnell schicken, ist ja ein Kollege', warum: 'Chats werden gespeichert und manchmal weitergeleitet. Schlüssel gehören da nicht hin.' },
            { text: 'Einen Screenshot schicken', warum: 'Auch Screenshots sind ein Sicherheitsrisiko.' },
          ],
        },
        {
          frage: 'Wofür ist der Header <code>Accept</code>?',
          antworten: [
            { text: 'Um das gewünschte Format der Antwort anzugeben', richtig: true },
            { text: 'Um das Format des eigenen Bodys anzugeben', warum: 'Das macht Content-Type.' },
            { text: 'Um eine Anfrage zu bestätigen', warum: 'Nein, es geht ums Format.' },
          ],
        },
      ],
    },
  ],
};
