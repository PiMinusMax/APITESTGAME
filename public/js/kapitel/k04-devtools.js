import { achtung, g, job, k, merke, normalisiere, tabelle } from '../ui.js';
import { geheimnisKnopf, paketFormular } from '../komponenten/geheimauftraege.js';
import { holeCodewort } from '../codewort.js';

const NETZ_SKIZZE = `
<div class="netz-skizze" aria-label="Skizze des Netzwerk-Tabs">
  <div class="netz-leiste"><span>🔴 Aufnahme</span><span>🚫 Leeren</span><span>☐ Log beibehalten</span><span>|</span><span>Alle</span><span class="an">Fetch/XHR</span><span>Dokument</span><span>CSS</span><span>JS</span><span>Bild</span></div>
  <table class="netz-tabelle">
    <thead><tr><th>Name</th><th>Status</th><th>Typ</th><th>Größe</th><th>Zeit</th></tr></thead>
    <tbody>
      <tr><td>hallo</td><td>200</td><td>fetch</td><td>412 B</td><td>14 ms</td></tr>
      <tr class="markiert"><td>geheimnis</td><td>200</td><td>fetch</td><td>498 B</td><td>11 ms</td></tr>
      <tr class="fehler"><td>paket</td><td>422</td><td>fetch</td><td>356 B</td><td>9 ms</td></tr>
    </tbody>
  </table>
  <div class="netz-details"><span class="an">Header</span><span>Nutzlast</span><span>Vorschau</span><span>Antwort</span><span>Zeit</span></div>
  <div style="padding:6px 10px" class="beschriftung">⬆️ Klickst du auf eine Zeile, öffnen sich diese Reiter mit allen Details.</div>
</div>`;

export default {
  id: 'devtools',
  icon: '🛠️',
  titel: 'Die Entwicklerwerkzeuge (DevTools)',
  untertitel: 'Dein Röntgenblick hinter die Kulissen jeder Webseite.',
  ziele: [
    'Die Entwicklerwerkzeuge öffnen und die wichtigsten Bereiche kennen',
    'Anfragen und Antworten im <strong>Netzwerk-Tab</strong> finden und lesen',
    'Einen Fehler selbst untersuchen, wenn eine Seite nur „Fehler“ sagt',
    'Cookies und gespeicherte Daten finden',
  ],
  merksaetze: [
    'Die DevTools öffnest du mit <kbd>F12</kbd> (Mac: <kbd>⌘</kbd>+<kbd>⌥</kbd>+<kbd>I</kbd>).',
    'Der <strong>Netzwerk-Tab</strong> zeigt jede Anfrage mit Status, Headern, gesendeten Daten und Antwort.',
    'Er zeichnet nur auf, solange er offen ist – im Zweifel die Seite neu laden.',
    'Wenn eine App nur „Fehler“ sagt: Die echte Ursache steht in der Antwort des Servers.',
    '<strong>Cookies</strong> sind Datenzettel, die der Browser automatisch bei jeder Anfrage mitschickt.',
  ],
  schritte: [
    {
      typ: 'text',
      titel: 'Dein Röntgenblick',
      html: `
        <p>Jeder moderne Browser hat eingebaute <strong>Entwicklerwerkzeuge</strong> – kurz ${g('devtools', 'DevTools')}. Damit siehst du, was hinter den Kulissen einer Webseite passiert: jede Anfrage, jede Antwort, jeden Fehler.</p>
        <p>Für Menschen, die mit Schnittstellen arbeiten, sind die DevTools so wichtig wie das Stethoskop für eine Ärztin. Keine Sorge: Du kannst damit nichts kaputtmachen. Alles, was du dort änderst, betrifft nur deinen eigenen Browser und ist nach dem Neuladen wieder weg.</p>
        <h3>So öffnest du die DevTools</h3>
        ${tabelle(
          ['', 'Windows / Linux', 'Mac'],
          [
            ['Tastenkürzel', `${k('F12')} oder ${k('Strg', 'Umschalt', 'I')}`, k('⌘', '⌥', 'I') + ' (Cmd + Option + I)'],
            ['Mit der Maus', 'Rechtsklick auf die Seite → „Untersuchen“', 'Rechtsklick → „Untersuchen“ / „Element untersuchen“'],
            ['Direkt zur Konsole', `${k('Strg', 'Umschalt', 'J')} (Chrome, Edge) · ${k('Strg', 'Umschalt', 'K')} (Firefox)`, `${k('⌘', '⌥', 'J')} (Chrome) · ${k('⌘', '⌥', 'K')} (Firefox)`],
          ],
        )}
        ${achtung('Nutze für dieses Spiel einen <strong>Computer</strong> mit <strong>Chrome, Edge oder Firefox</strong>. Auf dem Handy gibt es keine DevTools. In Safari musst du sie erst in den Einstellungen unter „Erweitert“ aktivieren.')}
        <p>💡 <strong>Platz-Tipp:</strong> Über das Menü der DevTools (⋮ bzw. ⋯ oben rechts) kannst du einstellen, ob sie <strong>rechts</strong> oder <strong>unten</strong> angedockt sind. Probier aus, was auf deinem Bildschirm besser passt.</p>
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k4-devtools-offen',
      titel: 'Öffne die DevTools',
      html: `<p>Öffne jetzt die Entwicklerwerkzeuge mit ${k('F12')} (Mac: ${k('⌘', '⌥', 'I')}). Lass sie für den Rest dieses Kapitels offen.</p>`,
      pruefung: { art: 'manuell', knopf: 'Sie sind offen!' },
      xp: 10,
    },
    {
      typ: 'text',
      titel: 'Ein kurzer Rundgang',
      html: `
        <p>Oben in den DevTools siehst du mehrere <strong>Reiter (Tabs)</strong>. Je nach Browser und Sprache heißen sie etwas anders. Die vier wichtigsten:</p>
        ${tabelle(
          ['Wofür?', 'Chrome / Edge', 'Firefox'],
          [
            ['🧱 Den Aufbau der Seite (HTML) ansehen', 'Elemente / Elements', 'Inspektor'],
            ['💬 Meldungen lesen, selbst Befehle eintippen', 'Konsole / Console', 'Konsole'],
            ['📡 <strong>Alle Anfragen und Antworten</strong>', '<strong>Netzwerk / Network</strong>', '<strong>Netzwerkanalyse</strong>'],
            ['🗄️ Gespeicherte Daten (Cookies, Speicher)', 'Anwendung / Application', 'Web-Speicher / Storage'],
          ],
        )}
        <p>Siehst du einen Reiter nicht? Er versteckt sich manchmal hinter <strong>»</strong> oder <strong>+</strong>. Für Schnittstellen-Arbeit ist der <strong>Netzwerk-Tab</strong> dein wichtigstes Werkzeug.</p>
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k4-codewort',
      titel: 'Eine Nachricht in der Konsole',
      html: `
        <p>Klicke in den DevTools auf den Reiter <strong>Konsole</strong>. Diese Seite hat dir dort beim Laden eine Nachricht mit einem <strong>Codewort</strong> hinterlassen. Wie lautet es?</p>
      `,
      pruefung: {
        art: 'antwort',
        platzhalter: 'Codewort',
        lokalPruefung: (wert) => normalisiere(wert) === normalisiere(holeCodewort()),
        falsch: 'Das ist nicht das Codewort. Es steht in der Konsole in oranger Schrift.',
      },
      xp: 15,
      tipps: [
        'Die Konsole ist leer? Lade die Seite neu (F5 bzw. ⌘+R) – die Nachricht wird beim Laden geschrieben. Das Codewort bleibt dabei gleich.',
        'Scrolle in der Konsole ganz nach oben. Die Nachricht beginnt mit „🛰️ Mission Schnittstelle“.',
      ],
      danach: `<p>Die Konsole ist der „Gesprächskanal“ einer Webseite: Programmierer schreiben dort Meldungen hinein – und rote <strong>Fehlermeldungen</strong> landen auch hier. In Kapitel 9 tippst du dort selbst Befehle ein!</p>`,
    },
    {
      typ: 'text',
      titel: 'Der Netzwerk-Tab',
      html: `
        <p>Öffne jetzt den Reiter <strong>Netzwerk</strong> (Firefox: <strong>Netzwerkanalyse</strong>). Er sieht ungefähr so aus:</p>
        ${NETZ_SKIZZE}
        <h3>So liest du die Liste</h3>
        <ul>
          <li><strong>Name:</strong> das Ende der Adresse, z. B. <code>hallo</code> für <code>/api/hallo</code></li>
          <li><strong>Status:</strong> der Statuscode der Antwort (200 = okay, Fehler werden rot)</li>
          <li><strong>Typ:</strong> Art der Anfrage. <code>fetch</code> oder <code>xhr</code> sind API-Aufrufe aus JavaScript, <code>document</code> sind ganze Seiten</li>
          <li><strong>Zeit:</strong> wie lange es bis zur Antwort gedauert hat (${g('latenz', 'Latenz')})</li>
        </ul>
        <h3>Drei Dinge, die du wissen musst</h3>
        <ol>
          <li><strong>Aufgezeichnet wird nur, solange der Tab offen ist.</strong> Ist die Liste leer, lade die Seite neu oder löse die Aktion noch einmal aus.</li>
          <li><strong>Filter „Fetch/XHR“</strong> (Firefox: „XHR“) blendet Bilder, Schriften und Co. aus – dann siehst du nur noch API-Anfragen.</li>
          <li><strong>Klick auf eine Zeile</strong> öffnet die Details. Die wichtigsten Reiter darin:
            <ul>
              <li><strong>Header / Kopfzeilen:</strong> Adresse, Methode, Statuscode und alle Header von Anfrage und Antwort</li>
              <li><strong>Nutzlast / Anfrage:</strong> was <em>du</em> mitgeschickt hast (der Body)</li>
              <li><strong>Vorschau</strong> und <strong>Antwort:</strong> was der <em>Server</em> zurückgeschickt hat – hübsch oder roh</li>
            </ul>
          </li>
        </ol>
        ${merke('Mit dem 🚫-Symbol leerst du die Liste. Das Häkchen <strong>„Log beibehalten“</strong> (Firefox: „Logs nicht leeren“) sorgt dafür, dass die Einträge beim Neuladen nicht verschwinden.')}
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k4-geheimcode',
      titel: 'Geheimauftrag 1: Die versteckte Antwort',
      html: `
        <p>Wenn du auf den Knopf drückst, holt die Seite ein Geheimnis vom Server. Die Antwort kommt an – aber die Seite zeigt sie dir nicht an.</p>
        <p><strong>Deine Aufgabe:</strong> Finde den <strong>Geheimcode</strong> im Netzwerk-Tab.</p>
      `,
      render: (ziel) => geheimnisKnopf(ziel),
      pruefung: { art: 'antwort', server: 'geheimcode', platzhalter: 'z. B. ABCDE-12' },
      tipps: [
        'Öffne zuerst den Netzwerk-Tab und drück DANN auf den Knopf. Sonst wird die Anfrage nicht aufgezeichnet.',
        'In der Liste erscheint eine Zeile namens <code>geheimnis</code>. Klick darauf.',
        'Schau in den Reiter <strong>Vorschau</strong> oder <strong>Antwort</strong>. Der Code steht beim Feld <code>geheimcode</code>.',
      ],
      danach: '<p>Genau so prüfst du im Job, welche Daten ein Server wirklich schickt – egal, was eine App daraus macht. 🕵️</p>',
    },
    {
      typ: 'aufgabe',
      id: 'k4-geheimhinweis',
      titel: 'Geheimauftrag 2: Die Botschaft im Header',
      html: `
        <p>In derselben Antwort steckt noch eine zweite Botschaft – diesmal <strong>nicht im Body</strong>, sondern in einem <strong>Header der Antwort</strong>. Er heißt <code>X-Geheimer-Hinweis</code>.</p>
      `,
      pruefung: { art: 'antwort', server: 'geheimhinweis', platzhalter: 'Wert des Headers' },
      tipps: [
        'Klick wieder auf die Zeile <code>geheimnis</code> und öffne den Reiter <strong>Header</strong> (Firefox: <strong>Kopfzeilen</strong>).',
        'Es gibt dort zwei Bereiche: Anfrage-Header (was du geschickt hast) und <strong>Antwort-Header</strong> (Response Headers, was der Server geschickt hat). Du suchst im zweiten.',
      ],
      danach: `<p>Header sind die „Aufkleber auf dem Umschlag“. Dort stehen z. B. das Datenformat (<code>Content-Type</code>) oder eine <code>X-Anfrage-ID</code> – die brauchst du später, wenn du einen Fehler meldest.</p>`,
    },
    {
      typ: 'aufgabe',
      id: 'k4-debugging',
      titel: 'Geheimauftrag 3: Detektivarbeit',
      html: `
        <p>Das hier ist eine (Übungs-)App eines Versanddienstes. Wenn du das Paket abschickst, sagt sie nur: „Hat nicht geklappt“. Sehr hilfreich … 🙄</p>
        <p><strong>Deine Aufgabe:</strong> Finde mit dem Netzwerk-Tab heraus, was der Server wirklich bemängelt. <strong>Welches Feld fehlt?</strong></p>
      `,
      render: (ziel) => paketFormular(ziel),
      pruefung: { art: 'antwort', server: 'fehlerfeld', platzhalter: 'Name des fehlenden Feldes' },
      tipps: [
        'Schick das Paket ab und such im Netzwerk-Tab die Zeile <code>paket</code>. Ihr Statuscode ist nicht 200 – sie ist vermutlich rot markiert.',
        'Im Reiter <strong>Nutzlast</strong> (Firefox: <strong>Anfrage</strong>) siehst du, was die App geschickt hat. Im Reiter <strong>Antwort</strong> steht, was der Server dazu sagt.',
      ],
      danach: `
        <p>Die App hat vergessen, die Postleitzahl (<code>plz</code>) mitzuschicken – und der Server hat das mit dem Statuscode <strong>422</strong> ganz klar gesagt. Die App hat die Nachricht nur nicht weitergegeben.</p>
        ${job('Das ist Alltag im Schnittstellen-Bereich: „Die Bestellung geht nicht durch!“ – Du öffnest die DevTools oder die Logs, schaust dir Anfrage und Antwort an und weißt in zwei Minuten, wo das Problem liegt.')}
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k4-spieler-id',
      titel: 'Geheimauftrag 4: Woher kennt der Server dich?',
      html: `
        <p>Ist dir aufgefallen, dass der Server weiß, welcher Geheimcode zu <em>dir</em> gehört? Das liegt an einem ${g('cookie', 'Cookie')}: einem kleinen Datenzettel, den der Server deinem Browser beim ersten Besuch gegeben hat. Der Browser schickt ihn bei <strong>jeder</strong> Anfrage automatisch wieder mit.</p>
        <p><strong>Deine Aufgabe:</strong> Finde den Wert deines Cookies <code>spieler_id</code>.</p>
      `,
      pruefung: { art: 'antwort', server: 'spieler_id', platzhalter: '12 Zeichen, z. B. 3f9a1c2b7d4e' },
      tipps: [
        'Chrome/Edge: Reiter <strong>Anwendung</strong> → links unter „Speicher“ → <strong>Cookies</strong> → die Adresse dieser Seite. Firefox: Reiter <strong>Web-Speicher</strong> → <strong>Cookies</strong>.',
        'Alternativ im Netzwerk-Tab: Klick auf eine beliebige Anfrage an <code>/api/…</code> → Header → bei den <strong>Anfrage-Headern</strong> steht <code>Cookie: spieler_id=…</code>',
      ],
      danach: `
        <p>Im Bereich Anwendung/Web-Speicher siehst du übrigens auch den <strong>lokalen Speicher</strong> (Local Storage). Dort merkt sich dieses Spiel deinen Fortschritt.</p>
        ${achtung('Cookies können Anmeldedaten enthalten. Wer dein Cookie hat, kann sich unter Umständen als du ausgeben. Darum: Cookies und Screenshots davon niemals weitergeben.')}
      `,
    },
    {
      typ: 'quiz',
      id: 'k4-quiz',
      fragen: [
        {
          frage: 'Mit welcher Taste öffnest du unter Windows in den meisten Browsern die DevTools?',
          antworten: [
            { text: 'F12', richtig: true },
            { text: 'F1', warum: 'F1 öffnet meist die Hilfe.' },
            { text: 'Esc', warum: 'Esc schließt eher Dinge.' },
          ],
        },
        {
          frage: 'In welchem Bereich der DevTools siehst du alle Anfragen und Antworten?',
          antworten: [
            { text: 'Netzwerk / Netzwerkanalyse', richtig: true },
            { text: 'Elemente / Inspektor', warum: 'Dort siehst du den HTML-Aufbau der Seite.' },
            { text: 'Anwendung / Web-Speicher', warum: 'Dort liegen gespeicherte Daten wie Cookies.' },
          ],
        },
        {
          frage: 'Du öffnest den Netzwerk-Tab, aber die Liste ist leer. Was tust du?',
          antworten: [
            { text: 'Die Seite neu laden oder die Aktion noch einmal auslösen', richtig: true },
            { text: 'Den Computer neu starten', warum: 'Viel zu aufwendig. Der Tab zeichnet einfach erst ab dem Öffnen auf.' },
            { text: 'Aufgeben – die Seite macht keine Anfragen', warum: 'Fast jede Seite macht Anfragen. Sie wurden nur noch nicht aufgezeichnet.' },
          ],
        },
        {
          frage: 'Eine App zeigt nur „Fehler“. Wo findest du die genaue Meldung des Servers?',
          antworten: [
            { text: 'Im Netzwerk-Tab: Anfrage anklicken → Antwort', richtig: true },
            { text: 'In der Adressleiste', warum: 'Dort steht nur die Adresse der aktuellen Seite.' },
            { text: 'Nirgends, die bleibt geheim', warum: 'Doch! Die Antwort kommt bei deinem Browser an – du kannst sie lesen.' },
          ],
        },
        {
          frage: 'Was ist ein Cookie?',
          antworten: [
            { text: 'Ein Datenzettel vom Server, den der Browser bei jeder Anfrage automatisch mitschickt', richtig: true },
            { text: 'Ein Virus', warum: 'Nein, Cookies sind ganz normale kleine Textdaten.' },
            { text: 'Ein Werbebanner', warum: 'Cookies werden zwar auch für Werbung genutzt, sind aber selbst nur Datenzettel.' },
          ],
        },
      ],
    },
  ],
};
