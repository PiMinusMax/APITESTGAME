import { code, g, job, merke, neugierig, tabelle } from '../ui.js';
import { jsonReparieren } from '../komponenten/json-reparieren.js';
import { findeVorlage } from '../daten/endpunkte.js';

const BEISPIEL = `{
  "name": "Erika Mustermann",
  "alter": 34,
  "kundin": true,
  "hobbys": ["Lesen", "Radfahren"],
  "adresse": {
    "stadt": "Köln",
    "plz": "50667"
  },
  "telefon": null
}`;

const LESE_JSON = `{
  "bestellung": "B-7731",
  "bezahlt": false,
  "kunden": [
    { "name": "Jonas", "stadt": "München" },
    { "name": "Aylin", "stadt": "Hamburg" },
    { "name": "Mehmet", "stadt": "Frankfurt" }
  ]
}`;

export default {
  id: 'datenformate',
  icon: '📦',
  titel: 'Datenformate: JSON und XML',
  untertitel: 'Damit beide Seiten die Daten gleich verstehen.',
  ziele: [
    'JSON lesen und selbst schreiben',
    'Typische JSON-Fehler erkennen und reparieren',
    'XML erkennen – und wissen, wo es in Unternehmen vorkommt',
  ],
  merksaetze: [
    '<strong>JSON</strong>: Objekte in <code>{ }</code>, Listen in <code>[ ]</code>, Schlüssel und Texte in <code>"doppelten Anführungszeichen"</code>.',
    'Zahlen, <code>true</code>/<code>false</code> und <code>null</code> stehen <strong>ohne</strong> Anführungszeichen.',
    'Kein Komma nach dem letzten Eintrag, keine einfachen Anführungszeichen.',
    '<strong>XML</strong> nutzt Tags wie <code>&lt;name&gt;…&lt;/name&gt;</code> und ist in Unternehmen (SOAP, E-Rechnung, Banken) weit verbreitet.',
  ],
  schritte: [
    {
      typ: 'text',
      titel: 'JSON – das Lieblingsformat der APIs',
      html: `
        <p>Wenn zwei Systeme Daten austauschen, müssen beide das Format verstehen – wie ein Formular mit festen Feldern. Das häufigste Format heute heißt ${g('json', 'JSON')} (<em>JavaScript Object Notation</em>, gesprochen „Dschäi-sonn“). Du hast es schon die ganze Zeit gesehen!</p>
        ${code('json', BEISPIEL, { titel: 'Beispiel: eine Kundin als JSON' })}
        <h3>Die Bausteine</h3>
        ${tabelle(
          ['Baustein', 'So sieht er aus', 'Bedeutung'],
          [
            ['Objekt', '<code>{ … }</code>', 'Eine Sammlung von Feldern – wie ein ausgefülltes Formular'],
            ['Feld', '<code>"schluessel": wert</code>', 'Name des Feldes (immer in "…") – Doppelpunkt – Wert'],
            ['Text (String)', '<code>"Köln"</code>', 'Immer in doppelten Anführungszeichen'],
            ['Zahl', '<code>34</code> oder <code>9.99</code>', 'Ohne Anführungszeichen, mit <strong>Punkt</strong> statt Komma!'],
            ['Wahrheitswert', '<code>true</code> / <code>false</code>', 'Ja oder nein – klein geschrieben, ohne Anführungszeichen'],
            ['Liste (Array)', '<code>[ …, … ]</code>', 'Mehrere Werte nacheinander'],
            ['Nichts', '<code>null</code>', 'Kein Wert vorhanden / unbekannt'],
          ],
        )}
        <p>Die einzelnen Felder trennt ein <strong>Komma</strong> – nach dem letzten Feld steht keins. Objekte und Listen kann man beliebig ineinander schachteln, wie bei <code>adresse</code> oben.</p>
        ${merke('Warum steht die PLZ <code>"50667"</code> in Anführungszeichen, obwohl es Ziffern sind? Weil Postleitzahlen wie <code>"01067"</code> (Dresden) mit 0 anfangen können. Als Zahl würde die führende Null verschwinden! Faustregel: Nur was man ausrechnen will, ist eine Zahl.')}
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k7-json-lesen',
      titel: 'JSON lesen',
      html: `
        ${code('json', LESE_JSON, { titel: 'Eine Bestellung', kopieren: false })}
        <p><strong>Frage:</strong> In welcher Stadt wohnt der <strong>zweite</strong> Kunde in der Liste?</p>
      `,
      pruefung: { art: 'antwort', lokal: ['Hamburg'], platzhalter: 'Stadt', falsch: 'Nicht ganz. Zähle die Einträge in der Liste „kunden“ von oben.' },
      xp: 15,
      danach: `<p>Richtig, Aylin aus Hamburg! 🎯 Kleiner Insider: Programmierer zählen ab <strong>0</strong>. Im Code heißt der zweite Kunde deshalb <code>kunden[1]</code>. Das wird dir im Job noch oft begegnen.</p>`,
    },
    {
      typ: 'aufgabe',
      id: 'k7-reparieren',
      titel: 'JSON-Werkstatt: Repariere die Fehler',
      html: `<p>JSON ist streng – ein einziges falsches Zeichen und nichts geht mehr. Jeder der folgenden Schnipsel hat genau <strong>einen typischen Fehler</strong>. Repariere sie direkt im Textfeld. Ändere dabei nur die Schreibweise, nicht die Werte.</p>`,
      render: (ziel, api) => jsonReparieren(ziel, api),
      pruefung: { art: 'lokal' },
      xp: 30,
      tipps: [
        'Schlüssel brauchen immer doppelte Anführungszeichen: <code>"name"</code>, nicht <code>name</code>.',
        'Zwischen zwei Feldern steht ein Komma – nach dem letzten Feld aber nicht.',
        'JSON kennt nur doppelte Anführungszeichen <code>"</code>, keine einfachen <code>\'</code>.',
      ],
      danach: '<p>Das sind die vier häufigsten JSON-Fehler überhaupt. Wenn eine API mit „Ungültiges JSON“ antwortet, schau genau nach diesen Stellen.</p>',
    },
    {
      typ: 'aufgabe',
      id: 'k7-steckbrief',
      titel: 'Dein Steckbrief als JSON',
      html: `
        <p>Jetzt schreibst du selbst JSON und schickst es an den Server. Der prüft genau, ob alles stimmt – wie eine echte API. Dein Steckbrief braucht diese Felder:</p>
        <ul>
          <li><code>name</code> – ein <strong>Text</strong> (ein Fantasiename ist völlig okay)</li>
          <li><code>lieblingszahl</code> – eine <strong>Zahl</strong></li>
          <li><code>mag_kaffee</code> – <strong>true</strong> oder <strong>false</strong></li>
          <li><code>hobbys</code> – eine <strong>Liste</strong> mit mindestens zwei Texten</li>
        </ul>
        <p>Die Vorlage ist absichtlich noch nicht fertig. Schick sie ruhig erst einmal so ab und lies, was der Server sagt!</p>
      `,
      vorlage: findeVorlage('Steckbrief senden'),
      pruefung: { art: 'erfolg', erfolg: 'steckbrief' },
      tipps: [
        'Lies die Antwort des Servers: Im Feld <code>details</code> steht für jedes Feld, was noch nicht passt.',
        'Beispiel für eine Liste: <code>"hobbys": ["Lesen", "Kochen"]</code>',
        'Zahlen und true/false ohne Anführungszeichen: <code>"lieblingszahl": 7</code>, <code>"mag_kaffee": true</code>',
      ],
      danach: '<p>Genau so arbeiten echte APIs: Sie prüfen jedes Feld auf den richtigen <strong>Typ</strong> und sagen dir, was nicht passt. Das nennt man <strong>Validierung</strong>. (Keine Sorge: Der Steckbrief wird nicht gespeichert.)</p>',
    },
    {
      typ: 'text',
      titel: 'XML – der ältere Bruder',
      html: `
        <p>Vor JSON war ${g('xml', 'XML')} das wichtigste Datenformat – und in vielen Unternehmen ist es das bis heute. XML verpackt Daten in <strong>Tags</strong>: <code>&lt;name&gt;</code> öffnet, <code>&lt;/name&gt;</code> schließt.</p>
        <div class="zwei-spalten">
          <div>${code('json', `{
  "name": "Erika Mustermann",
  "alter": 34,
  "hobbys": ["Lesen", "Radfahren"],
  "adresse": {
    "stadt": "Köln",
    "plz": "50667"
  }
}`, { titel: 'JSON', kopieren: false })}</div>
          <div>${code('xml', `<person typ="kundin">
  <name>Erika Mustermann</name>
  <alter>34</alter>
  <hobbys>
    <hobby>Lesen</hobby>
    <hobby>Radfahren</hobby>
  </hobbys>
  <adresse>
    <stadt>Köln</stadt>
    <plz>50667</plz>
  </adresse>
</person>`, { titel: 'Dieselben Daten als XML', kopieren: false })}</div>
        </div>
        <p>Zusätzlich kennt XML <strong>Attribute</strong> direkt im Tag, wie <code>typ="kundin"</code>.</p>
        ${tabelle(
          ['', 'JSON', 'XML'],
          [
            ['Lesbarkeit', 'kompakt, gut lesbar', 'ausführlicher, viele Tags'],
            ['Größe', 'klein', 'größer (jeder Wert hat Start- und End-Tag)'],
            ['Typen', 'kennt Zahl, Text, true/false, null', 'alles ist erst einmal Text'],
            ['Regeln prüfen', 'JSON Schema', 'XSD (XML Schema) – sehr streng und mächtig'],
            ['Typisch für', 'moderne Web- und App-APIs', 'SOAP, Banken, Behörden, E-Rechnungen, ältere Systeme'],
          ],
        )}
        ${job('XML wirst du im Schnittstellen-Bereich garantiert sehen: bei SOAP-Diensten (Kapitel 11), bei E-Rechnungen (XRechnung, ZUGFeRD), im Zahlungsverkehr der Banken (ISO 20022, z. B. camt- und pain-Dateien) und in vielen ERP-Systemen.')}
        ${neugierig(`<p>Ein drittes Format, das dir oft begegnen wird, ist ${g('csv', 'CSV')} – Tabellendaten als einfacher Text:</p>
          ${code('csv', `kunde_id;name;stadt
1;Max Mustermann;Berlin
2;Aylin Yılmaz;Hamburg`, { kopieren: false })}
          <p>In Deutschland wird oft das Semikolon <code>;</code> als Trenner benutzt – weil das Komma bei uns schon für Dezimalzahlen (9,99 €) vergeben ist. Ein Klassiker für Fehler zwischen Systemen!</p>`)}
      `,
    },
    {
      typ: 'quiz',
      id: 'k7-quiz',
      fragen: [
        {
          frage: 'Welche Zeile ist gültiges JSON?',
          antworten: [
            { text: '<code>{"stadt": "Berlin"}</code>', richtig: true },
            { text: '<code>{stadt: "Berlin"}</code>', warum: 'Der Schlüssel braucht Anführungszeichen.' },
            { text: "<code>{'stadt': 'Berlin'}</code>", warum: 'JSON erlaubt nur doppelte Anführungszeichen.' },
            { text: '<code>{"stadt": "Berlin",}</code>', warum: 'Nach dem letzten Eintrag darf kein Komma stehen.' },
          ],
        },
        {
          frage: 'Wie schreibt man eine Liste in JSON?',
          antworten: [
            { text: 'In eckigen Klammern: <code>["a", "b"]</code>', richtig: true },
            { text: 'In geschweiften Klammern: <code>{"a", "b"}</code>', warum: 'Geschweifte Klammern sind für Objekte mit Schlüsseln.' },
            { text: 'In runden Klammern: <code>("a", "b")</code>', warum: 'Runde Klammern gibt es in JSON nicht.' },
          ],
        },
        {
          frage: 'Was bedeutet <code>null</code> in JSON?',
          antworten: [
            { text: 'Kein Wert vorhanden', richtig: true },
            { text: 'Die Zahl 0', warum: '0 wäre die Zahl Null. null heißt „nichts da“.' },
            { text: 'Ein Fehler', warum: 'null ist ganz normales, gültiges JSON.' },
          ],
        },
        {
          frage: 'Wo begegnet dir XML im Unternehmen typischerweise?',
          antworten: [
            { text: 'Bei SOAP-Schnittstellen, E-Rechnungen und Banken', richtig: true },
            { text: 'Nirgends mehr, das ist ausgestorben', warum: 'Ganz im Gegenteil – XML ist in Unternehmen noch sehr verbreitet.' },
            { text: 'Nur in Computerspielen', warum: 'Nein, vor allem in Geschäftsanwendungen.' },
          ],
        },
        {
          frage: 'Warum steht die PLZ <code>"01067"</code> in Anführungszeichen?',
          antworten: [
            { text: 'Damit die führende 0 nicht verloren geht', richtig: true },
            { text: 'Weil Zahlen in JSON immer Anführungszeichen brauchen', warum: 'Nein, Zahlen stehen normalerweise ohne. Aber eine PLZ ist eigentlich ein Text.' },
            { text: 'Das ist ein Fehler', warum: 'Das ist Absicht – mit gutem Grund.' },
          ],
        },
      ],
    },
  ],
};
