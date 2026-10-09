import { achtung, code, el, g, job, k, merke, neugierig } from '../ui.js';
import { roboterBrett } from '../komponenten/roboter-brett.js';
import { wetterBaukasten } from '../komponenten/url-werkzeuge.js';
import { store } from '../zustand.js';

const BEWEGEN = `await fetch("/api/roboter/bewegen", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ richtung: "rechts", schritte: 2 })
});`;

const FARBE = `await fetch("/api/roboter", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ farbe: "lila" })
});`;

const SPRECHEN = `await fetch("/api/roboter/sprechen", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Hallo Welt!" })
});`;

const NEUSTART = `await fetch("/api/roboter/neustart", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ level: 2 })
});`;

export default {
  id: 'konsole',
  icon: '💻',
  titel: 'Die Konsole: Anfragen selbst programmieren',
  untertitel: 'Mit ein paar Zeilen JavaScript steuerst du diese Seite – und Roboter Bit.',
  ziele: [
    'Die Konsole sicher benutzen',
    'Mit <code>fetch</code> selbst GET- und POST-Anfragen schreiben',
    'Diese Seite über die API steuern: Roboter Bit durch drei Level lotsen',
    'Profi-Trick: eine Anfrage aus dem Netzwerk-Tab kopieren und verändern',
  ],
  merksaetze: [
    '<code>fetch("/adresse")</code> schickt eine GET-Anfrage. <code>await</code> wartet auf die Antwort.',
    'Für andere Methoden gibt man ein zweites Argument mit: <code>method</code>, <code>headers</code>, <code>body</code>.',
    '<code>JSON.stringify(…)</code> macht aus einem JavaScript-Objekt JSON-Text für den Body.',
    'Im Netzwerk-Tab: Rechtsklick → Kopieren → „Als fetch kopieren“ – ein super Werkzeug zur Fehlersuche.',
    'Niemals Code von Fremden in die Konsole einfügen.',
  ],
  schritte: [
    {
      typ: 'text',
      titel: 'Die Konsole: ein Gespräch mit der Seite',
      html: `
        <p>Du kennst die ${g('konsole', 'Konsole')} schon aus Kapitel 4. Jetzt sprichst du selbst mit ihr! Du tippst einen Befehl in der Programmiersprache <strong>JavaScript</strong> ein, drückst <kbd>Enter</kbd> – und der Browser führt ihn sofort aus.</p>
        <p>Öffne die Konsole (${k('Strg', 'Umschalt', 'J')} in Chrome/Edge, ${k('Strg', 'Umschalt', 'K')} in Firefox, Mac: ${k('⌘', '⌥', 'J')} bzw. ${k('⌘', '⌥', 'K')}) und probier zum Aufwärmen:</p>
        ${code('js', '2 + 2')}
        ${code('js', '"hallo api".toUpperCase()')}
        <p>Nützliche Tricks:</p>
        <ul>
          <li>Mit <kbd>↑</kbd> holst du deinen letzten Befehl zurück.</li>
          <li>Mit <kbd>Umschalt</kbd>+<kbd>Enter</kbd> machst du eine neue Zeile, ohne auszuführen.</li>
          <li>Mit dem 🚫-Symbol oder ${k('Strg', 'L')} leerst du die Konsole.</li>
        </ul>
        ${achtung(`<p><strong>Füge niemals Code ein, den du nicht verstehst oder von Fremden bekommen hast!</strong> Betrüger versuchen so, Konten zu übernehmen („Kopier das mal in deine Konsole …“).</p>
          <p>Deshalb warnen Chrome und Firefox, wenn du zum ersten Mal etwas einfügst. Lies die Warnung, tippe dann den angezeigten Satz ein (z. B. <code>Einfügen zulassen</code> oder <code>allow pasting</code>) und drücke Enter. Danach klappt das Einfügen. Bei Code aus diesem Spiel ist das in Ordnung.</p>`, 'Sicherheit geht vor')}
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k9-hallo',
      titel: 'Sag Hallo zum Spiel',
      html: `
        <p>Diese Seite hat ein kleines Hilfsobjekt namens <code>spiel</code> eingebaut. Tippe in die Konsole:</p>
        ${code('js', 'spiel.hallo()')}
        <p>und drücke <kbd>Enter</kbd>. Probier danach auch <code>spiel.hilfe()</code> aus.</p>
      `,
      render: (ziel, api) => {
        const pruefe = () => store.daten.konsoleHallo && api.erledigt();
        api.kontext.aufraeumen(store.abonnieren((typ) => typ === 'konsole-hallo' && pruefe()));
        pruefe();
      },
      pruefung: { art: 'lokal' },
      xp: 15,
      tipps: ['Achte auf die Klammern am Ende: <code>spiel.hallo()</code> – ohne Klammern wird die Funktion nur angezeigt, aber nicht ausgeführt.'],
    },
    {
      typ: 'aufgabe',
      id: 'k9-fetch',
      titel: 'fetch: deine erste Anfrage mit Code',
      html: `
        <p>Mit dem Befehl ${g('fetch', 'fetch')} schickt JavaScript HTTP-Anfragen – genau wie die Werkstatt, nur eben per Code. Tippe die drei Zeilen <strong>einzeln</strong> ein und drücke nach jeder <kbd>Enter</kbd>:</p>
        ${code('js', 'const antwort = await fetch("/api/hallo");')}
        ${code('js', 'antwort.status')}
        ${code('js', 'await antwort.json()')}
        <p><strong>Was passiert da?</strong></p>
        <ol>
          <li><code>fetch("/api/hallo")</code> schickt eine GET-Anfrage. <code>await</code> heißt „warte, bis die Antwort da ist“ – das Netzwerk braucht ja einen Moment. Die Antwort merken wir uns unter dem Namen <code>antwort</code>.</li>
          <li><code>antwort.status</code> zeigt den Statuscode.</li>
          <li><code>antwort.json()</code> liest den Body und macht daraus ein Objekt, das die Konsole schön anzeigt (zum Aufklappen auf den Pfeil ▸ klicken).</li>
        </ol>
        <p>Schau danach in den <strong>Netzwerk-Tab</strong>: Deine Anfrage ist dort auch aufgetaucht!</p>
      `,
      pruefung: { art: 'erfolg', erfolg: 'konsole_fetch' },
      tipps: [
        'Meldet die Konsole „antwort has already been declared“ (schon vorhanden)? Dann lade die Seite neu oder nimm einen anderen Namen, z. B. <code>const antwort2 = …</code>',
        'Groß- und Kleinschreibung zählt: <code>fetch</code>, nicht <code>Fetch</code>.',
      ],
    },
    {
      typ: 'aufgabe',
      id: 'k9-post',
      titel: 'POST mit fetch',
      html: `
        <p>Für alles außer GET bekommt <code>fetch</code> ein zweites Argument: ein Objekt mit <code>method</code>, <code>headers</code> und <code>body</code>. Kopiere diesen Code in die Konsole und drück <kbd>Enter</kbd>:</p>
        ${code('js', `await fetch("/api/notizen", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ titel: "Aus der Konsole", text: "Ich kann jetzt fetch!" })
});`)}
        <ul>
          <li><code>method</code> – die HTTP-Methode</li>
          <li><code>headers</code> – die Header, hier der Content-Type</li>
          <li><code>body</code> – die Daten. <code>JSON.stringify(…)</code> wandelt das JavaScript-Objekt in JSON-Text um.</li>
        </ul>
      `,
      pruefung: { art: 'erfolg', erfolg: 'konsole_post' },
      danach: `<p>Die Konsole zeigt dir ein <code>Response</code>-Objekt. Klapp es auf: Dort findest du <code>status: 201</code>. Und auf dem Notizbrett in Kapitel 5 hängt jetzt deine neue Notiz. 📌</p>
        ${merke('Die Werkstatt kann dir übrigens jede Anfrage als fetch-Code anzeigen: Nach dem Senden auf den Reiter „Als Code“ klicken.')}`,
    },
    {
      typ: 'aufgabe',
      id: 'k9-roboter',
      titel: 'Mission: Steuere Roboter Bit',
      html: `
        <p>Das ist <strong>Bit</strong> 🤖. Bit hat keine Knöpfe – er hört nur auf <strong>API-Befehle</strong>. Alles, was du ihm aus der Konsole schickst, siehst du sofort hier auf dem Spielfeld. Bring ihn zum Stern ⭐!</p>
        <p>Koordinaten: <strong>x</strong> zählt nach rechts, <strong>y</strong> nach unten – beide beginnen bei 0. Läuft Bit gegen eine Mauer 🧱, bleibt er davor stehen.</p>
      `,
      render: (ziel, api) => {
        roboterBrett(ziel, api.kontext);
        ziel.append(
          el('div', {
            html: `<h3>Die Befehle – zum Kopieren und Anpassen</h3>
              ${code('js', BEWEGEN, { titel: 'Bewegen – richtung: oben, unten, links, rechts · schritte: 1 bis 10' })}
              ${code('js', FARBE, { titel: 'Farbe (oder name) ändern – z. B. rot, gruen, blau, lila, pink, gelb …' })}
              ${code('js', SPRECHEN, { titel: 'Etwas sagen lassen' })}
              ${code('js', NEUSTART, { titel: 'Level starten / neu starten' })}`,
          }),
        );
      },
      pruefung: {
        art: 'teilziele',
        ziele: [
          { erfolg: 'roboter_bewegt', text: 'Bewege Bit mit <code>POST /api/roboter/bewegen</code>', kurz: 'Bit bewegt' },
          { erfolg: 'roboter_farbe', text: 'Gib Bit eine neue Farbe mit <code>PATCH /api/roboter</code>', kurz: 'Bit umgefärbt' },
          { erfolg: 'roboter_spricht', text: 'Lass Bit etwas sagen', kurz: 'Bit spricht' },
          { erfolg: 'roboter_ziel_1', text: 'Bring Bit in <strong>Level 1</strong> zum Stern', kurz: 'Level 1 geschafft', xp: 20 },
          { erfolg: 'roboter_ziel_2', text: 'Starte <strong>Level 2</strong> und schaffe es', kurz: 'Level 2 geschafft', xp: 25 },
          { erfolg: 'roboter_ziel_3', text: 'Meistere das Labyrinth in <strong>Level 3</strong>', kurz: 'Level 3 geschafft', xp: 30, optional: true },
          { erfolg: 'roboter_name', text: 'Gib Bit einen neuen Namen (<code>{ "name": "…" }</code>)', kurz: 'Neuer Name', optional: true },
        ],
      },
      xp: 30,
      tipps: [
        'Passiert nichts? Schau in der Konsole nach einer roten Fehlermeldung und im Netzwerk-Tab nach dem Statuscode. Bei 400 steht im Body, was nicht stimmt.',
        'Für mehrere Felder auf einmal: <code>schritte: 6</code> statt sechsmal einen Schritt.',
        'Bit steht am Ziel und reagiert nicht mehr? Ein geschafftes Level muss neu gestartet werden – mit dem Neustart-Befehl und <code>level: 2</code>.',
        'Mit <code>spiel.roboter()</code> bekommst du alle Befehle direkt in der Konsole.',
      ],
      danach: `<p>Stark! 🎉 Du hast diese Seite über eine API gesteuert. Genau so funktionieren auch echte Systeme: Eine App schickt Befehle an eine API – und irgendwo bewegt sich ein Lagerroboter, schaltet ein Licht oder startet eine Maschine.</p>
        ${neugierig('<p>Hast du bemerkt, dass der Server mit <strong>409 Conflict</strong> antwortet, wenn du Bit am Ziel noch bewegen willst? Die Anfrage ist richtig gebaut, passt aber nicht zum aktuellen <em>Zustand</em>. Und Level, die noch gesperrt sind, quittiert der Server mit <strong>403</strong>.</p>')}`,
    },
    {
      typ: 'aufgabe',
      id: 'k9-kopieren',
      titel: 'Profi-Trick: Anfrage kopieren und verändern',
      html: `
        <p>Im Job sagt jemand: „Die App zeigt falsche Daten!“ Ein super Trick: Du kopierst genau die Anfrage, die die App gemacht hat, und spielst damit herum.</p>
        <ol>
          <li>Öffne den <strong>Netzwerk-Tab</strong> und klick unten auf „Wetter abfragen“.</li>
          <li><strong>Rechtsklick</strong> auf die neue Zeile <code>wetter?stadt=Berlin…</code> → <strong>Kopieren</strong> → <strong>Als fetch kopieren</strong> (Firefox: „Als Fetch kopieren“).</li>
          <li>Füge den Code in die <strong>Konsole</strong> ein, ändere <code>Berlin</code> in <code>Dresden</code> und drück <kbd>Enter</kbd>.</li>
        </ol>
      `,
      render: (ziel) => wetterBaukasten(ziel, { staedte: ['Berlin'], markiert: false }),
      pruefung: { art: 'erfolg', erfolg: 'wetter_dresden', warteText: 'Warte auf eine Anfrage für Dresden …' },
      tipps: [
        'Der kopierte Code ist lang – das ist normal. Die Stadt steht ganz am Anfang in der Adresse.',
        'Firefox bietet zusätzlich: Rechtsklick → „Bearbeiten und erneut senden“. Damit kannst du die Anfrage direkt in den DevTools ändern.',
      ],
      danach: `${job('„Als fetch kopieren“ und „Als cURL kopieren“ sind echte Alltagswerkzeuge: Damit stellst du eine fehlerhafte Anfrage exakt nach, schickst sie einer Kollegin oder testest sie in Postman. Aber denk an Kapitel 8: Kopierte Anfragen enthalten oft Cookies und Tokens!')}`,
    },
    {
      typ: 'quiz',
      id: 'k9-quiz',
      fragen: [
        {
          frage: 'Was macht <code>fetch("/api/hallo")</code>?',
          antworten: [
            { text: 'Es schickt eine GET-Anfrage an /api/hallo', richtig: true },
            { text: 'Es löscht /api/hallo', warum: 'Ohne weitere Angaben schickt fetch immer GET.' },
            { text: 'Es öffnet eine neue Webseite', warum: 'Nein, es holt nur Daten – im Hintergrund.' },
          ],
        },
        {
          frage: 'Wofür braucht man <code>JSON.stringify(…)</code> beim Body?',
          antworten: [
            { text: 'Es verwandelt ein JavaScript-Objekt in JSON-Text', richtig: true },
            { text: 'Es verschlüsselt die Daten', warum: 'Nein, verschlüsselt wird durch HTTPS.' },
            { text: 'Es prüft die Antwort des Servers', warum: 'Es bereitet die Daten für die Anfrage vor.' },
          ],
        },
        {
          frage: 'Was solltest du in der Konsole NIEMALS tun?',
          antworten: [
            { text: 'Code einfügen, den dir ein Fremder geschickt hat', richtig: true },
            { text: '2 + 2 ausrechnen', warum: 'Das ist völlig harmlos. 😄' },
            { text: 'Eigene fetch-Anfragen ausprobieren', warum: 'Genau dafür ist sie da!' },
          ],
        },
      ],
    },
  ],
};
