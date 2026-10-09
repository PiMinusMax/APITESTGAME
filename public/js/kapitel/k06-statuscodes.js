import { g, job, merke, tabelle } from '../ui.js';
import { ALBUM, ALBUM_PFLICHT, statuscodeAlbum } from '../komponenten/statuscode-album.js';
import { STATUSCODES } from '../daten/statuscodes.js';

const WICHTIGE = [200, 201, 204, 301, 304, 400, 401, 403, 404, 405, 409, 415, 422, 429, 500, 502, 503, 504];

export default {
  id: 'statuscodes',
  icon: '🚦',
  titel: 'Statuscodes: Was der Server dir sagen will',
  untertitel: 'Drei Ziffern, die dir sofort verraten, was los ist.',
  ziele: [
    'Die fünf Klassen von Statuscodes unterscheiden',
    'Die wichtigsten Codes kennen – und selbst provozieren',
    'Richtig reagieren: Wann liegt der Fehler bei dir, wann beim Server?',
  ],
  merksaetze: [
    '<strong>2xx</strong> = Erfolg, <strong>3xx</strong> = Umleitung, <strong>4xx</strong> = Fehler beim Client (also bei dir), <strong>5xx</strong> = Fehler beim Server.',
    'Bei 4xx: die eigene Anfrage prüfen. Bei 5xx: später erneut versuchen oder den Betreiber informieren.',
    'Lies bei Fehlern immer den <strong>Body</strong> – gute APIs erklären dort, was los ist.',
    'Bei <strong>429</strong> langsamer werden und den Header <code>Retry-After</code> beachten.',
  ],
  schritte: [
    {
      typ: 'text',
      titel: 'Drei Ziffern mit großer Wirkung',
      html: `
        <p>Jede Antwort beginnt mit einem ${g('statuscode', 'Statuscode')}: einer dreistelligen Zahl. Die <strong>erste Ziffer</strong> verrät schon fast alles:</p>
        ${tabelle(
          ['Klasse', 'Bedeutung', 'Bei der Post wäre das …'],
          [
            ['<span class="status-pille status-2">2xx</span>', '✅ <strong>Erfolg</strong> – hat geklappt', '„Zugestellt!“'],
            ['<span class="status-pille status-3">3xx</span>', '↪️ <strong>Umleitung</strong> – schau woanders', '„Empfänger umgezogen, hier die neue Adresse.“'],
            ['<span class="status-pille status-4">4xx</span>', '🙋 <strong>Fehler beim Client</strong> – <em>du</em> hast etwas falsch gemacht', '„Adresse unvollständig“ oder „Briefmarke fehlt“'],
            ['<span class="status-pille status-5">5xx</span>', '🔥 <strong>Fehler beim Server</strong> – <em>er</em> hat ein Problem', '„Das Postamt hat heute wegen Wasserschaden geschlossen.“'],
          ],
        )}
        <p>(Es gibt auch noch 1xx für Zwischenmeldungen – die siehst du in der Praxis fast nie.)</p>
        ${merke('Eselsbrücke: <strong>4</strong>xx = „<strong>Vier</strong>-mal hinschauen, was <em>ich</em> falsch gemacht habe.“ <strong>5</strong>xx = „<strong>Fünf</strong> gerade sein lassen, der Server ist schuld.“')}
      `,
    },
    {
      typ: 'text',
      titel: 'Die wichtigsten Codes',
      html: `
        <p>Diese Codes begegnen dir im Job immer wieder. Du musst sie nicht auswendig lernen – du wirst sie mit der Zeit einfach kennen.</p>
        ${tabelle(
          ['Code', 'Name', 'Was heißt das?'],
          WICHTIGE.map((c) => [`<span class="status-pille status-${String(c)[0]}">${c}</span>`, STATUSCODES[c].name, STATUSCODES[c].erklaerung]),
        )}
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k6-album',
      titel: 'Das Statuscode-Sammelalbum',
      html: `
        <p>Jetzt wird gesammelt! Provoziere den Server so, dass er dir unterschiedliche Statuscodes schickt. Jeder Code, den du bekommst, klebt sich automatisch ins Album.</p>
        <p>Für dieses Kapitel brauchst du die <strong>${ALBUM_PFLICHT.length} Pflicht-Sticker</strong> mit Stern (★). Die anderen sind Bonus – manche bekommst du ganz nebenbei in späteren Kapiteln.</p>
        <p>Benutze, was du willst: die <strong>Werkstatt</strong>, die <strong>Adressleiste</strong> in einem neuen Tab – und beobachte alles im <strong>Netzwerk-Tab</strong>.</p>
      `,
      render: (ziel, api) => statuscodeAlbum(ziel, api.kontext),
      pruefung: {
        art: 'teilziele',
        versteckt: true,
        ziele: [
          ...ALBUM.filter((a) => a.pflicht).map((a) => ({ statuscode: a.code, text: `Statuscode ${a.code}`, kurz: `Sticker ${a.code}`, xp: 10 })),
          ...ALBUM.filter((a) => !a.pflicht).map((a) => ({ statuscode: a.code, text: `Statuscode ${a.code}`, kurz: `Sticker ${a.code}`, xp: 5, optional: true })),
        ],
      },
      xp: 30,
      tipps: [
        'Klick bei einem leeren Sticker auf „Wie?“ – dort steht, wie du ihn bekommst.',
        'Für 405 brauchst du eine andere Methode als GET. Das geht nicht in der Adressleiste, aber in der Werkstatt.',
        'Für 429 musst du schnell sein: In der Werkstatt viermal hintereinander auf „Senden“ klicken – oder in der Adressleiste mehrmals schnell neu laden.',
      ],
      danach: `
        <p>Großartig! 🏅 Ist dir bei <strong>301</strong> im Netzwerk-Tab etwas aufgefallen? Dort stehen <strong>zwei</strong> Anfragen: erst die alte Adresse mit 301, dann folgt der Browser automatisch der neuen Adresse aus dem Header <code>Location</code>.</p>
        <p>Und bei <strong>429</strong> steht in den Antwort-Headern <code>Retry-After</code> – die Sekunden, die du warten sollst.</p>
      `,
    },
    {
      typ: 'text',
      titel: 'Wie reagiert man als Schnittstellen-Profi?',
      html: `
        <ul>
          <li><span class="status-pille status-2">2xx</span> Alles gut – aber trotzdem kurz in den Body schauen. Manche Schnittstellen melden Fehler auch mit 200 (das siehst du in Kapitel 12).</li>
          <li><span class="status-pille status-4">4xx</span> Die eigene Anfrage prüfen: Stimmen Adresse, Methode, Header, Body, Zugangsdaten? Die Fehlermeldung im Body sagt meist genau, was fehlt.</li>
          <li><span class="status-pille status-4">429</span> Langsamer werden. Warten, wie lange <code>Retry-After</code> sagt, dann erneut versuchen.</li>
          <li><span class="status-pille status-5">5xx</span> Meist nicht deine Schuld. Später erneut versuchen. Hält der Fehler an: den Betreiber informieren.</li>
        </ul>
        ${job(`Eine gute Fehlermeldung an ein anderes Team enthält immer:
          <ul>
            <li>🕐 Zeitpunkt (möglichst genau)</li>
            <li>📍 Methode und Adresse, z. B. <code>POST /api/bestellungen</code></li>
            <li>🚦 Statuscode und Fehlermeldung aus dem Body</li>
            <li>🔖 die Anfrage-ID aus dem Header (bei uns <code>X-Anfrage-ID</code>) – damit findet das Team deine Anfrage in seinen Logs</li>
          </ul>
          „Geht nicht“ allein hilft niemandem. 😉`)}
      `,
    },
    {
      typ: 'quiz',
      id: 'k6-quiz',
      fragen: [
        {
          frage: 'Was bedeutet 404?',
          antworten: [{ text: 'Nicht gefunden', richtig: true }, { text: 'Server abgestürzt', warum: 'Das wäre ein 5xx-Code.' }, { text: 'Erfolgreich angelegt', warum: 'Das ist 201.' }],
        },
        {
          frage: 'Ein Code beginnt mit 5. Wo liegt das Problem meistens?',
          antworten: [
            { text: 'Beim Server', richtig: true },
            { text: 'Bei meiner Anfrage', warum: 'Das wären 4xx-Codes.' },
            { text: 'Es ist gar kein Problem', warum: 'Doch – 5xx sind Fehler.' },
          ],
        },
        {
          frage: 'Du bekommst 429 Too Many Requests. Was tust du?',
          antworten: [
            { text: 'Kurz warten (Retry-After beachten) und langsamer weitermachen', richtig: true },
            { text: 'Sofort noch viel öfter senden', warum: 'Dann bleibst du nur länger gesperrt. 😅' },
            { text: 'Die Adresse ändern', warum: 'Die Adresse stimmt – du warst nur zu schnell.' },
          ],
        },
        {
          frage: 'Nach POST einer neuen Notiz kommt 201. Was heißt das?',
          antworten: [
            { text: 'Erfolgreich angelegt', richtig: true },
            { text: 'Es hat nicht geklappt', warum: '2xx heißt immer Erfolg.' },
            { text: 'Umgeleitet', warum: 'Umleitungen sind 3xx.' },
          ],
        },
        {
          frage: 'Du bekommst 400 Bad Request. Was solltest du als Erstes tun?',
          antworten: [
            { text: 'Die Fehlermeldung im Body lesen und die eigene Anfrage prüfen', richtig: true },
            { text: 'Dem Server-Team sagen, dass ihr Server kaputt ist', warum: 'Bei 4xx liegt der Fehler meistens bei der Anfrage – also erst selbst prüfen.' },
            { text: 'Einfach 10-mal wiederholen', warum: 'Eine fehlerhafte Anfrage bleibt auch beim zehnten Mal fehlerhaft.' },
          ],
        },
      ],
    },
  ],
};
