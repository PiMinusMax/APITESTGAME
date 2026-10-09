import { code, g, merke, neugierig } from '../ui.js';
import { ersteAnfrage } from '../komponenten/erste-anfrage.js';

export default {
  id: 'anfrage-antwort',
  icon: '📨',
  titel: 'Anfrage und Antwort',
  untertitel: 'Client, Server und die Sprache HTTP.',
  ziele: [
    'Was Client und Server sind',
    'Dass immer der Client fragt und der Server antwortet',
    'Aus welchen Teilen eine HTTP-Anfrage und eine Antwort bestehen',
  ],
  merksaetze: [
    'Der <strong>Client</strong> fragt, der <strong>Server</strong> antwortet. Ohne Anfrage keine Antwort.',
    'Eine Anfrage hat: <strong>Methode, Adresse, Header</strong> und manchmal einen <strong>Body</strong>.',
    'Eine Antwort hat: <strong>Statuscode, Header</strong> und meist einen <strong>Body</strong>.',
    '<strong>HTTP</strong> ist die gemeinsame Sprache. <strong>HTTPS</strong> ist dieselbe Sprache, aber verschlüsselt.',
  ],
  schritte: [
    {
      typ: 'text',
      titel: 'Client und Server',
      html: `
        <p>Bei jeder Schnittstelle gibt es zwei Rollen:</p>
        <ul>
          <li><strong>${g('client', 'Client')}</strong> (der Fragende): Er möchte etwas wissen oder etwas erledigt haben. Das kann dein Browser sein, eine Handy-App – oder ein anderes Programm.</li>
          <li><strong>${g('server', 'Server')}</strong> (der Antwortende): Ein Computer, der rund um die Uhr wartet, bis jemand etwas von ihm will, und dann antwortet.</li>
        </ul>
        <p>Das Prinzip heißt <strong>Anfrage und Antwort</strong> (englisch: <em>Request</em> und <em>Response</em>). Wichtig: <strong>Immer der Client fängt an.</strong> Ein Server meldet sich nicht von selbst – so wie ein Kellner nicht ungefragt Essen bringt.</p>
        ${merke('Ein Server kann gleichzeitig Client sein! Der Online-Shop ist Server für deinen Browser – und Client, wenn er beim Zahlungsdienst nachfragt.')}
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k2-erste-anfrage',
      titel: 'Deine allererste Anfrage',
      html: '<p>Genug Theorie – jetzt wird es echt! Drück auf den Knopf. Dein Browser schickt dann eine <strong>echte Anfrage</strong> über das Internet an den Server dieses Spiels.</p>',
      pruefung: { art: 'lokal' },
      render: (ziel, api) => ersteAnfrage(ziel, api),
      danach: `
        <p><strong>Was ist gerade passiert?</strong></p>
        <ol>
          <li>Dein Browser (der Client) hat eine Anfrage geschickt: „<code>GET /api/hallo</code>“ – also „Gib mir, was unter /api/hallo liegt“.</li>
          <li>Der Server hat die Anfrage bekommen und eine Antwort gebaut.</li>
          <li>Die Antwort kam mit dem Statuscode <strong>200</strong> zurück – das heißt „Alles okay“. Die Daten sind im Format <strong>JSON</strong> (dazu später mehr).</li>
        </ol>
        <p>Das alles hat nur ein paar Millisekunden gedauert. 🚀</p>
      `,
    },
    {
      typ: 'text',
      titel: 'Wie sieht so eine Nachricht aus?',
      html: `
        <p>Eine HTTP-Nachricht ist wie ein Brief: Außen auf dem Umschlag stehen Adresse und Zusatzinfos, innen steckt der eigentliche Inhalt. So sah deine Anfrage gerade aus (leicht vereinfacht):</p>
        ${code('http', `GET /api/hallo HTTP/1.1
Host: ${location.host}
Accept: application/json
User-Agent: Mozilla/5.0 (dein Browser)`, { titel: 'Anfrage (Request)', kopieren: false })}
        <p>Und das war die Antwort des Servers:</p>
        ${code('http', `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
X-Anfrage-ID: req-3f9a1c2b

{
  "nachricht": "Hallo! 👋 Du hast gerade erfolgreich eine Anfrage an die API geschickt.",
  "methode": "GET",
  "pfad": "/api/hallo"
}`, { titel: 'Antwort (Response)', kopieren: false })}
        <h3>Die Bausteine einer Anfrage</h3>
        <div class="http-teile">
          <div class="http-teil"><strong>Methode</strong><span>Was soll passieren? <code>GET</code> heißt „lesen“. Es gibt noch andere, z. B. <code>POST</code> für „anlegen“ (Kapitel 5).</span></div>
          <div class="http-teil"><strong>Adresse (URL)</strong><span>Wohin geht die Anfrage? Hier: <code>/api/hallo</code> auf dem Server ${location.host}.</span></div>
          <div class="http-teil"><strong>${g('header', 'Header')}</strong><span>Zusatzinfos im Format <code>Name: Wert</code> – z. B. „Ich hätte die Antwort gern als JSON“ (<code>Accept</code>).</span></div>
          <div class="http-teil"><strong>${g('body', 'Body')}</strong><span>Der eigentliche Inhalt, z. B. Daten für eine neue Bestellung. Bei <code>GET</code> meistens leer.</span></div>
        </div>
        <p>Die Antwort ist genauso gebaut – nur steht oben statt der Methode ein <strong>${g('statuscode', 'Statuscode')}</strong>: <code>200 OK</code>. Du lernst sie in Kapitel 6 kennen.</p>
        ${merke('Diese Bausteine siehst du ab jetzt in jedem Kapitel wieder: <strong>Methode · Adresse · Header · Body</strong> – und in der Antwort der <strong>Statuscode</strong>.')}
      `,
    },
    {
      typ: 'text',
      titel: 'HTTP – die gemeinsame Sprache',
      html: `
        <p>Damit Client und Server sich verstehen, brauchen sie gemeinsame Regeln – so wie eine Grammatik. Solche Regeln nennt man ${g('protokoll', 'Protokoll')}. Das Protokoll des Webs heißt <strong>${g('http', 'HTTP')}</strong> (<em>Hypertext Transfer Protocol</em>).</p>
        <p>Jede Webseite, die du öffnest, und fast jede App nutzt HTTP. Auch diese Seite: Das Spiel hat beim Laden schon dutzende HTTP-Anfragen gestellt – für Texte, Bilder und Programmcode.</p>
        <h3>HTTP oder HTTPS?</h3>
        <div class="zwei-spalten">
          <div class="box box-achtung" style="margin:0"><div class="box-titel">✉️ HTTP = Postkarte</div>Jeder, der die Karte unterwegs in die Hand bekommt, kann sie lesen – oder heimlich ändern.</div>
          <div class="box box-merke" style="margin:0"><div class="box-titel">🔒 ${g('https', 'HTTPS')} = versiegelter Brief</div>Der Inhalt ist verschlüsselt. Nur Absender und Empfänger können ihn lesen.</div>
        </div>
        <p>Im echten Leben gilt: <strong>Schnittstellen laufen immer über HTTPS</strong> – besonders, wenn Passwörter oder Kundendaten unterwegs sind.</p>
        ${neugierig('<p>HTTP gibt es seit 1991. Erfunden hat es Tim Berners-Lee am Forschungszentrum CERN – zusammen mit der ersten Webseite. Heute gibt es die Versionen HTTP/1.1, HTTP/2 und HTTP/3. Sie sind schneller, aber das Prinzip „Anfrage und Antwort“ ist gleich geblieben.</p>')}
      `,
    },
    {
      typ: 'quiz',
      id: 'k2-quiz',
      fragen: [
        {
          frage: 'Wer beginnt bei HTTP immer die Kommunikation?',
          antworten: [
            { text: 'Der Client', richtig: true },
            { text: 'Der Server', warum: 'Der Server wartet – er antwortet nur, wenn er gefragt wird.' },
            { text: 'Beide gleichzeitig', warum: 'Nein, es ist immer erst die Anfrage, dann die Antwort.' },
          ],
        },
        {
          frage: 'Was gehört NICHT zu einer Anfrage, sondern zur Antwort?',
          antworten: [
            { text: 'Der Statuscode', richtig: true },
            { text: 'Die Methode', warum: 'Die Methode (z. B. GET) steht in der Anfrage.' },
            { text: 'Die Adresse', warum: 'Die Adresse braucht die Anfrage, damit sie ankommt.' },
          ],
          erklaerung: 'Mit dem Statuscode sagt der Server, wie es gelaufen ist (z. B. 200 = OK).',
        },
        {
          frage: 'Wofür stehen Header?',
          antworten: [
            { text: 'Für Zusatzinformationen im Format „Name: Wert“', richtig: true },
            { text: 'Für die Überschrift einer Webseite', warum: 'Verwechslungsgefahr! Gemeint sind die Zusatzinfos auf dem „Umschlag“ der Nachricht.' },
            { text: 'Für das Passwort des Servers', warum: 'Header können zwar Zugangsdaten enthalten, sind aber allgemein Zusatzinfos.' },
          ],
        },
        {
          frage: 'Was bedeutet das „S“ in HTTPS?',
          antworten: [
            { text: 'Secure – die Verbindung ist verschlüsselt', richtig: true },
            { text: 'Speed – besonders schnell', warum: 'Es geht um Sicherheit, nicht Geschwindigkeit.' },
            { text: 'Server', warum: 'Nein, „S“ steht für Secure.' },
          ],
        },
        {
          frage: 'Kann ein Server selbst Client sein?',
          antworten: [
            { text: 'Ja – wenn er selbst bei einem anderen Server nachfragt', richtig: true },
            { text: 'Nein, niemals', warum: 'Doch! Ein Shop-Server fragt z. B. beim Zahlungsdienst nach und ist dann der Client.' },
          ],
        },
      ],
    },
  ],
};
