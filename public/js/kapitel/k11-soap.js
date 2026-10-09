import { code, g, job, merke, neugierig, tabelle } from '../ui.js';
import { findeVorlage, soapUmschlag } from '../daten/endpunkte.js';

const ANTWORT = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:lag="urn:mission-schnittstelle:lager">
  <soap:Body>
    <lag:LagerbestandAbfragenResponse>
      <lag:artikelnummer>A-1001</lag:artikelnummer>
      <lag:bezeichnung>USB-C-Kabel (1 m)</lag:bezeichnung>
      <lag:bestand>240</lag:bestand>
      <lag:lagerort>Regal 1-A</lag:lagerort>
    </lag:LagerbestandAbfragenResponse>
  </soap:Body>
</soap:Envelope>`;

const FAULT = `<soap:Fault>
  <faultcode>soap:Client</faultcode>
  <faultstring>Artikel A-9999 ist unbekannt.</faultstring>
</soap:Fault>`;

export default {
  id: 'soap',
  icon: '🧼',
  titel: 'SOAP: der Klassiker aus der Unternehmenswelt',
  untertitel: 'Streng, ausführlich, zuverlässig – und immer noch überall.',
  ziele: [
    'Verstehen, was SOAP ist und wo es eingesetzt wird',
    'Den Aufbau einer SOAP-Nachricht lesen: Envelope, Header, Body',
    'Den Vertrag (WSDL) lesen und eine echte SOAP-Anfrage schicken',
    'REST und SOAP vergleichen',
  ],
  merksaetze: [
    '<strong>SOAP</strong> ist ein Protokoll: Alles ist XML, verpackt in einem <strong>Envelope</strong> mit Header und Body.',
    'Der Vertrag eines SOAP-Dienstes ist die <strong>WSDL</strong>: Operationen, Datentypen, Adresse.',
    'SOAP-Anfragen gehen meist per <strong>POST</strong> an <strong>eine</strong> Adresse – die Operation steht im Body.',
    'Fehler kommen als <strong>SOAP-Fault</strong>, meist mit HTTP-Status 500.',
  ],
  schritte: [
    {
      typ: 'text',
      titel: 'Was ist SOAP?',
      html: `
        <p>${g('soap', 'SOAP')} (früher: <em>Simple Object Access Protocol</em>) gibt es seit etwa dem Jahr 2000. Anders als REST ist SOAP kein lockerer Bauplan, sondern ein <strong>strenges Protokoll</strong> mit festen Regeln:</p>
        <ul>
          <li>📄 Alle Nachrichten sind <strong>XML</strong>.</li>
          <li>✉️ Jede Nachricht steckt in einem <strong>Umschlag</strong> (${g('envelope', 'Envelope')}) mit optionalem <strong>Header</strong> und einem <strong>Body</strong>.</li>
          <li>📜 Es gibt einen maschinenlesbaren <strong>Vertrag</strong>: die ${g('wsdl', 'WSDL')}.</li>
          <li>📮 Meist geht alles per <strong>POST an eine einzige Adresse</strong>. Welche Funktion du willst, steht im Body.</li>
        </ul>
        <div class="zwei-spalten">
          <div class="box box-merke" style="margin:0"><div class="box-titel">🌐 REST ist wie …</div>… eine Postkarte an eine genaue Adresse. Kurz, formlos, schnell geschrieben.</div>
          <div class="box box-job" style="margin:0"><div class="box-titel">🧼 SOAP ist wie …</div>… ein Behördenformular im Umschlag. Jedes Feld ist vorgeschrieben, nichts darf fehlen – dafür ist alles eindeutig.</div>
        </div>
        ${job('SOAP gilt als „alt“, ist aber in vielen Branchen Alltag: Banken, Versicherungen, Behörden, Gesundheitswesen, Logistik und große ERP-Systeme (z. B. SAP). Gerade im Schnittstellen-Bereich wirst du SOAP-Diensten begegnen – oft dort, wo es um viel Geld oder strenge Regeln geht.')}
      `,
    },
    {
      typ: 'text',
      titel: 'Aufbau einer SOAP-Nachricht',
      html: `
        <p>So sieht eine Anfrage an den Lagerdienst unseres Übungs-Shops aus:</p>
        ${code('xml', soapUmschlag('A-1001'), { titel: 'SOAP-Anfrage', kopieren: false })}
        <ul>
          <li><code>&lt;soap:Envelope&gt;</code> – der Umschlag um alles herum.</li>
          <li><code>xmlns:soap="…"</code> und <code>xmlns:lag="…"</code> – sogenannte <strong>Namensräume</strong>. Sie sagen, aus welchem „Wörterbuch“ ein Begriff stammt. <code>soap:</code> sind die SOAP-Regeln, <code>lag:</code> die Begriffe des Lagerdienstes.</li>
          <li><code>&lt;soap:Header/&gt;</code> – optional, z. B. für Sicherheitsinformationen. Hier leer.</li>
          <li><code>&lt;soap:Body&gt;</code> – der Inhalt: die <strong>Operation</strong> <code>LagerbestandAbfragen</code> mit dem Parameter <code>artikelnummer</code>.</li>
        </ul>
        <p>Zusätzlich gehört der HTTP-Header <code>Content-Type: text/xml</code> dazu und oft auch <code>SOAPAction</code> mit dem Namen der Operation. Die Antwort ist genauso verpackt:</p>
        ${code('xml', ANTWORT, { titel: 'SOAP-Antwort', kopieren: false })}
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k11-wsdl',
      titel: 'Den Vertrag lesen: die WSDL',
      html: `
        <p>Jeder SOAP-Dienst hat eine WSDL-Datei – seinen Vertrag. Meist erreicht man sie, indem man <code>?wsdl</code> an die Adresse hängt.</p>
        <p>Öffne <a href="/soap/lager?wsdl" target="_blank" rel="noopener"><strong>/soap/lager?wsdl</strong></a> in einem neuen Tab. Keine Panik, das ist viel XML! Oben steht ein Kommentar, der die Bereiche erklärt. Die angebotenen <strong>Operationen</strong> findest du im Bereich <code>&lt;portType&gt;</code>.</p>
        <p><strong>Frage:</strong> Wie heißt die Operation, mit der man den Bestand eines Artikels abfragt?</p>
      `,
      pruefung: { art: 'antwort', lokal: ['LagerbestandAbfragen'], platzhalter: 'Name der Operation', falsch: 'Nicht ganz. Such im Bereich <portType> nach <operation name="…">.' },
      xp: 15,
      tipps: ['Nutze die Suche im Browser (<kbd>Strg</kbd>+<kbd>F</kbd>, Mac: <kbd>⌘</kbd>+<kbd>F</kbd>) und suche nach <code>operation name</code>.'],
      danach: '<p>Richtig! Aus einer WSDL können Werkzeuge wie <strong>SoapUI</strong> oder Postman automatisch fertige Beispiel-Anfragen erzeugen. Und Programmierer lassen sich daraus sogar Code generieren.</p>',
    },
    {
      typ: 'aufgabe',
      id: 'k11-anfrage',
      titel: 'Deine erste SOAP-Anfrage',
      html: `
        <p>Lade die SOAP-Vorlage in die Werkstatt. Schau dir die Header an (<code>Content-Type</code> und <code>SOAPAction</code>) und den Body.</p>
        <p><strong>Deine Aufgabe:</strong> Ändere die Artikelnummer auf <code>A-1002</code> und schick die Anfrage ab. <strong>Wie viele Stück sind auf Lager?</strong></p>
      `,
      vorlage: findeVorlage('SOAP: Lagerbestand abfragen'),
      pruefung: { art: 'antwort', server: 'soap_bestand', platzhalter: 'Bestand (Zahl)' },
      xp: 25,
      tipps: ['Die Artikelnummer steht im Body zwischen <code>&lt;lag:artikelnummer&gt;</code> und <code>&lt;/lag:artikelnummer&gt;</code>.', 'Die Antwort steht im Element <code>&lt;lag:bestand&gt;</code>.'],
    },
    {
      typ: 'aufgabe',
      id: 'k11-fault',
      titel: 'Wenn es knallt: der SOAP-Fault',
      html: `
        <p>Frag jetzt nach einem Artikel, den es <strong>nicht</strong> gibt, zum Beispiel <code>A-9999</code>. Was antwortet der Dienst?</p>
      `,
      vorlage: { ...findeVorlage('SOAP: Lagerbestand abfragen'), body: soapUmschlag('A-9999') },
      pruefung: { art: 'erfolg', erfolg: 'soap_fault' },
      xp: 15,
      danach: `
        <p>Ein <strong>SOAP-Fault</strong>! So meldet SOAP Fehler:</p>
        ${code('xml', FAULT, { kopieren: false })}
        <ul>
          <li><code>faultcode</code> sagt, wer schuld ist: <code>Client</code> (deine Anfrage) oder <code>Server</code> (der Dienst).</li>
          <li><code>faultstring</code> erklärt den Fehler in Worten.</li>
        </ul>
        ${merke('Der HTTP-Status war <strong>500</strong> – obwohl eigentlich deine Anfrage falsch war. Das ist bei SOAP (Version 1.1) so festgelegt. Bei SOAP-Diensten also immer in den Fault schauen, nicht nur auf den Statuscode!')}
      `,
    },
    {
      typ: 'text',
      titel: 'REST und SOAP im Vergleich',
      html: `
        ${tabelle(
          ['', '🌐 REST', '🧼 SOAP'],
          [
            ['Art', 'Architekturstil (Bauplan)', 'Protokoll mit festen Regeln'],
            ['Datenformat', 'meist JSON, auch XML', 'immer XML'],
            ['Adressen', 'viele – eine pro Ressource', 'meist eine – die Operation steht im Body'],
            ['Methoden', 'GET, POST, PUT, PATCH, DELETE', 'fast immer POST'],
            ['Vertrag', 'OpenAPI (empfohlen, aber freiwillig)', 'WSDL (fester Bestandteil)'],
            ['Fehler', 'über Statuscodes + Body', 'SOAP-Fault (meist mit 500)'],
            ['Stärken', 'einfach, leichtgewichtig, schnell zu lernen', 'streng, eindeutig, eingebaute Sicherheits-Standards (WS-Security)'],
            ['Typisch für', 'Web, Apps, Cloud-Dienste', 'Banken, Versicherungen, Behörden, ERP'],
            ['Werkzeuge', 'Postman, curl, Browser', 'SoapUI, Postman'],
          ],
        )}
        ${neugierig('<p>Es gibt zwei SOAP-Versionen: 1.1 (Content-Type <code>text/xml</code> + Header <code>SOAPAction</code>) und 1.2 (Content-Type <code>application/soap+xml</code>). Unser Übungsdienst versteht beide Content-Types.</p>')}
      `,
    },
    {
      typ: 'quiz',
      id: 'k11-quiz',
      fragen: [
        {
          frage: 'Welches Datenformat nutzt SOAP?',
          antworten: [{ text: 'XML', richtig: true }, { text: 'JSON', warum: 'JSON ist typisch für REST.' }, { text: 'CSV', warum: 'CSV sind einfache Tabellendaten.' }],
        },
        {
          frage: 'Was beschreibt eine WSDL?',
          antworten: [
            { text: 'Den Vertrag: Operationen, Datentypen und Adresse des Dienstes', richtig: true },
            { text: 'Das Passwort des Dienstes', warum: 'Nein, die WSDL ist öffentlich lesbar.' },
            { text: 'Wie schnell der Server ist', warum: 'Nein, es geht um das „Was“ und „Wie“ der Schnittstelle.' },
          ],
        },
        {
          frage: 'Wie heißt der äußerste „Umschlag“ einer SOAP-Nachricht?',
          antworten: [{ text: 'Envelope', richtig: true }, { text: 'Body', warum: 'Der Body steckt IM Envelope.' }, { text: 'Header', warum: 'Der Header steckt auch im Envelope.' }],
        },
        {
          frage: 'Mit welcher HTTP-Methode werden SOAP-Anfragen meistens geschickt?',
          antworten: [{ text: 'POST', richtig: true }, { text: 'GET', warum: 'GET nutzt man höchstens für die WSDL.' }, { text: 'DELETE', warum: 'Nein, bei SOAP steht die Aktion im Body.' }],
        },
        {
          frage: 'Wie meldet ein SOAP-Dienst einen Fehler?',
          antworten: [
            { text: 'Mit einem SOAP-Fault im Body, meist mit HTTP-Status 500', richtig: true },
            { text: 'Gar nicht, er antwortet einfach nicht', warum: 'Doch – mit einem genau beschriebenen Fault.' },
            { text: 'Immer mit 404', warum: 'Bei SOAP ist meist 500 der Status, Details stehen im Fault.' },
          ],
        },
      ],
    },
  ],
};
