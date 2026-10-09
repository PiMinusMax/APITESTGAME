import { c, code, g, merke, neugierig } from '../ui.js';
import { urlAnatomie, wetterBaukasten } from '../komponenten/url-werkzeuge.js';

const basis = () => location.origin;

export default {
  id: 'urls',
  icon: '🧭',
  titel: 'Die Adresse: URLs und Endpunkte',
  untertitel: 'Wohin genau geht eine Anfrage?',
  ziele: [
    'Aus welchen Teilen eine URL besteht',
    'Was ein Endpunkt ist',
    'Wie Query-Parameter funktionieren – und dass deine Adressleiste ein API-Client ist',
  ],
  merksaetze: [
    'Eine <strong>URL</strong> besteht aus Protokoll, Host, (Port), Pfad und Query-Parametern.',
    'Ein <strong>Endpunkt</strong> ist eine bestimmte Adresse einer API, z. B. <code>/api/wetter</code>.',
    'Query-Parameter beginnen mit <code>?</code>, sind <code>name=wert</code>-Paare und werden mit <code>&amp;</code> verbunden.',
    'Die Adressleiste des Browsers schickt <strong>GET-Anfragen</strong> – du kannst damit APIs abfragen.',
  ],
  schritte: [
    {
      typ: 'komponente',
      titel: 'Eine Adresse in ihren Einzelteilen',
      html: `
        <p>Jede Anfrage braucht ein Ziel. Dieses Ziel ist eine ${g('url', 'URL')} – eine Adresse wie die, die oben in deinem Browser steht. Eine URL ist aufgebaut wie eine Postanschrift: vom Groben zum Feinen.</p>
        <p>Hier ist die URL einer (ausgedachten) Wetter-API. Klick auf die farbigen Teile:</p>
      `,
      render: (ziel) => urlAnatomie(ziel),
      htmlDanach: merke('Protokoll → Host → Port → Pfad → Query-Parameter. Vom „Wie“ über das „Wo“ bis zum „Was genau“.'),
    },
    {
      typ: 'text',
      titel: 'Endpunkte: die Funktionen einer API',
      html: `
        <p>Eine API bietet meist viele Funktionen an. Jede hat ihre eigene Adresse – man nennt sie ${g('endpunkt', 'Endpunkt')} (englisch: <em>Endpoint</em>).</p>
        <p>Die API dieses Spiels läuft unter der Basis-Adresse <code>${basis()}</code>. Ein paar ihrer Endpunkte:</p>
        <ul>
          <li><code>/api/hallo</code> – die Begrüßung, die du schon kennst</li>
          <li><code>/api/wetter</code> – Übungs-Wetterdaten</li>
          <li><code>/api/notizen</code> – deine Notizen (Kapitel 5)</li>
        </ul>
        <p>Weil Anfragen und Spielseite auf demselben Server liegen, reicht oft der <strong>Pfad</strong>: <code>/api/hallo</code> ist kurz für <code>${basis()}/api/hallo</code>. Profis sagen: Der Pfad ist <em>relativ</em>, die volle Adresse <em>absolut</em>.</p>
      `,
    },
    {
      typ: 'komponente',
      titel: 'Query-Parameter ausprobieren',
      html: `
        <p>Der Wetter-Endpunkt braucht eine Zusatzangabe: <strong>Für welche Stadt?</strong> Solche Zusatzwünsche schreibt man als ${g('query', 'Query-Parameter')} hinter ein Fragezeichen.</p>
        <p>Ändere Stadt und Einheit und achte darauf, wie sich die Adresse verändert:</p>
      `,
      render: (ziel) => wetterBaukasten(ziel),
      htmlDanach: `<p>Die Reihenfolge der Parameter ist egal: ${c('?stadt=Berlin&einheit=celsius')} und ${c('?einheit=celsius&stadt=Berlin')} bedeuten dasselbe.</p>`,
    },
    {
      typ: 'aufgabe',
      id: 'k3-muenchen',
      titel: 'Die Adressleiste ist auch ein Client',
      html: `
        <p>Der Baukasten oben kennt nur drei Städte. Die API kann aber mehr! Du brauchst den Baukasten gar nicht: Die <strong>Adressleiste deines Browsers</strong> kann selbst Anfragen schicken.</p>
        <p><strong>Deine Aufgabe:</strong> Finde heraus, wie das Wetter in <strong>München</strong> ist. Öffne dafür einen <strong>neuen Tab</strong> (${'<kbd>Strg</kbd>+<kbd>T</kbd>'}, Mac: <kbd>⌘</kbd>+<kbd>T</kbd>), tippe die passende Adresse ein und drücke <kbd>Enter</kbd>. Komm danach hierher zurück.</p>
        <p>Die Basis-Adresse kannst du hier kopieren:</p>
        ${code('text', basis(), { titel: 'Basis-Adresse' })}
      `,
      pruefung: { art: 'erfolg', erfolg: 'wetter_muenchen', warteText: 'Warte auf deine Anfrage für München …' },
      tipps: [
        'Schau dir an, wie die Adresse im Baukasten oben aussieht. Du musst nur die Stadt austauschen.',
        `Die Adresse beginnt mit <code>${basis()}</code>, dann kommt der Pfad <code>/api/wetter</code> und dann der Query-Parameter für die Stadt.`,
      ],
      loesung: `<p>Tippe in die Adressleiste: <code>${basis()}/api/wetter?stadt=München</code></p>`,
      danach: `
        <p>Du hast gerade ohne jedes Werkzeug eine API abgefragt! 🎉 Was du im neuen Tab gesehen hast, war die „rohe“ Antwort im JSON-Format. Firefox zeigt sie hübsch aufbereitet an, Chrome und Edge haben dafür das Häkchen „Pretty-print“ / „Automatisch formatieren“.</p>
        <p>Übrigens: Die Adressleiste kann nur <strong>GET</strong>-Anfragen (Daten lesen). Für alles andere brauchst du Werkzeuge – die lernst du gleich kennen.</p>
      `,
    },
    {
      typ: 'text',
      titel: 'Sonderzeichen in Adressen',
      html: `
        <p>Leerzeichen, Umlaute und manche Sonderzeichen dürfen in einer URL eigentlich nicht vorkommen. Deshalb werden sie <strong>umgewandelt (codiert)</strong>. Der Browser macht das automatisch:</p>
        <div class="tabelle-rahmen"><table class="tabelle">
          <thead><tr><th>Zeichen</th><th>In der URL</th><th>Beispiel</th></tr></thead>
          <tbody>
            <tr><td>Leerzeichen</td><td><code>%20</code> oder <code>+</code></td><td><code>?stadt=Frankfurt%20am%20Main</code></td></tr>
            <tr><td>ü</td><td><code>%C3%BC</code></td><td><code>?stadt=M%C3%BCnchen</code></td></tr>
            <tr><td>&amp;</td><td><code>%26</code></td><td><code>?firma=M%C3%BCller%20%26%20S%C3%B6hne</code></td></tr>
          </tbody>
        </table></div>
        ${merke('Siehst du später in den Entwicklerwerkzeugen komische Zeichen wie <code>%C3%BC</code>, ist das kein Fehler – sondern ein codiertes ü.')}
        ${neugierig('<p>Pfade sind übrigens oft <strong>groß-/kleinschreibungsempfindlich</strong>: <code>/api/hallo</code> und <code>/api/Hallo</code> können unterschiedliche Dinge sein. Probier es aus: Öffne <code>' + basis() + '/api/Hallo</code> – was antwortet der Server?</p>')}
      `,
    },
    {
      typ: 'quiz',
      id: 'k3-quiz',
      fragen: [
        {
          frage: 'Was ist in <code>https://shop.example/api/produkte?farbe=rot</code> der Pfad?',
          antworten: [
            { text: '<code>/api/produkte</code>', richtig: true },
            { text: '<code>shop.example</code>', warum: 'Das ist der Host (die Domain) – sozusagen die Hausadresse.' },
            { text: '<code>?farbe=rot</code>', warum: 'Das ist ein Query-Parameter.' },
          ],
        },
        {
          frage: 'Womit beginnen die Query-Parameter in einer URL?',
          antworten: [
            { text: 'Mit einem Fragezeichen <code>?</code>', richtig: true },
            { text: 'Mit einem Und-Zeichen <code>&amp;</code>', warum: 'Das & verbindet mehrere Parameter – der erste beginnt aber mit ?.' },
            { text: 'Mit einem Schrägstrich <code>/</code>', warum: 'Schrägstriche trennen die Teile des Pfads.' },
          ],
        },
        {
          frage: 'Wie verbindet man zwei Query-Parameter?',
          antworten: [
            { text: '<code>?stadt=Berlin&amp;einheit=celsius</code>', richtig: true },
            { text: '<code>?stadt=Berlin?einheit=celsius</code>', warum: 'Das Fragezeichen kommt nur einmal, ganz am Anfang.' },
            { text: '<code>?stadt=Berlin,einheit=celsius</code>', warum: 'Fast – aber das Trennzeichen ist &.' },
          ],
        },
        {
          frage: 'Was ist ein Endpunkt?',
          antworten: [
            { text: 'Eine bestimmte Adresse einer API, unter der eine Funktion erreichbar ist', richtig: true },
            { text: 'Das letzte Zeichen einer URL', warum: 'Nein, ein Endpunkt ist eine Adresse wie /api/wetter.' },
            { text: 'Der Moment, in dem der Server abstürzt', warum: 'Zum Glück nicht. 😄' },
          ],
        },
        {
          frage: 'Welche Art von Anfrage schickt die Adressleiste deines Browsers?',
          antworten: [
            { text: 'GET – Daten lesen', richtig: true },
            { text: 'DELETE – Daten löschen', warum: 'Zum Glück nicht! Sonst würde jedes Öffnen einer Seite etwas löschen.' },
            { text: 'Gar keine, sie zeigt nur Text an', warum: 'Doch – jedes Enter in der Adressleiste ist eine HTTP-Anfrage.' },
          ],
        },
      ],
    },
  ],
};
