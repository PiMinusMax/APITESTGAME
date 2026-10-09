import { g, job, m, merke, neugierig, tabelle } from '../ui.js';
import { notizbrett } from '../komponenten/notizbrett.js';
import { findeVorlage } from '../daten/endpunkte.js';
import { server } from '../zustand.js';

const neuesteNotizId = () => {
  const liste = server.notizen ?? [];
  return liste.length ? Math.max(...liste.map((n) => n.id)) : 2;
};

export default {
  id: 'methoden',
  icon: '🔧',
  titel: 'HTTP-Methoden: GET, POST, PUT, PATCH, DELETE',
  untertitel: 'Die Verben der API-Sprache – und deine erste eigene Werkstatt.',
  ziele: [
    'Welche HTTP-Methoden es gibt und wofür sie stehen',
    'Was <strong>CRUD</strong> bedeutet',
    'Mit der <strong>Anfrage-Werkstatt</strong> selbst Anfragen bauen: lesen, anlegen, ändern, löschen',
  ],
  merksaetze: [
    '<strong>GET</strong> liest, <strong>POST</strong> legt an, <strong>PUT</strong> ersetzt komplett, <strong>PATCH</strong> ändert teilweise, <strong>DELETE</strong> löscht.',
    'Das sind die vier Grundoperationen <strong>CRUD</strong>: Create, Read, Update, Delete.',
    'Daten für POST/PUT/PATCH stehen im <strong>Body</strong>. Der Header <code>Content-Type: application/json</code> sagt, dass es JSON ist.',
    'POST zweimal geschickt = zwei Einträge. Vorsicht bei Wiederholungen!',
  ],
  schritte: [
    {
      typ: 'text',
      titel: 'Methoden sind die Verben',
      html: `
        <p>Die Adresse (URL) sagt, <strong>worum</strong> es geht – zum Beispiel um deine Notizen. Die ${g('methode', 'Methode')} sagt, <strong>was damit passieren soll</strong>. Stell dir ein Notizbuch vor:</p>
        ${tabelle(
          ['Methode', 'Bedeutung', 'Im Notizbuch', 'CRUD'],
          [
            [m('GET'), 'Daten <strong>lesen</strong>', '📖 Eine Seite aufschlagen und lesen', 'Read'],
            [m('POST'), 'Etwas <strong>neu anlegen</strong>', '➕ Eine neue Seite beschreiben', 'Create'],
            [m('PUT'), 'Komplett <strong>ersetzen</strong>', '♻️ Seite herausreißen und neu schreiben', 'Update'],
            [m('PATCH'), 'Teilweise <strong>ändern</strong>', '✏️ Ein Wort ausradieren und verbessern', 'Update'],
            [m('DELETE'), '<strong>Löschen</strong>', '🗑️ Seite herausreißen', 'Delete'],
          ],
        )}
        <p>${g('crud', 'CRUD')} – <em>Create, Read, Update, Delete</em> – sind die vier Grundoperationen fast jeder Software. Ob Kunden, Bestellungen oder Rechnungen: Am Ende wird angelegt, gelesen, geändert und gelöscht.</p>
      `,
    },
    {
      typ: 'komponente',
      titel: 'Deine Anfrage-Werkstatt',
      html: `
        <p>Unten rechts findest du ab jetzt immer den Knopf <strong>🧰 Werkstatt</strong>. Damit baust du Anfragen selbst zusammen – ähnlich wie mit ${g('postman', 'Postman')}, einem Werkzeug, das du im Job oft sehen wirst.</p>
        <ul>
          <li><strong>Vorlage laden:</strong> fertige Beispiel-Anfragen zum Anpassen</li>
          <li><strong>Methode + Adresse:</strong> die Zeile ganz oben, daneben <strong>Senden</strong></li>
          <li><strong>Header</strong> und <strong>Body:</strong> Zusatzinfos und Daten</li>
          <li>Darunter erscheint die <strong>Antwort</strong> mit Statuscode, Body und Headern</li>
          <li><strong>Server-Protokoll:</strong> zeigt live, was beim Server angekommen ist</li>
        </ul>
        <p>Und hier ist dein <strong>Notizbrett</strong>. Es zeigt live, was auf dem Server gespeichert ist. Alles, was du gleich per API änderst, siehst du hier sofort:</p>
      `,
      render: (ziel, kontext) => notizbrett(ziel, kontext),
      htmlDanach: merke('Lass beim Arbeiten mit der Werkstatt auch den <strong>Netzwerk-Tab</strong> der DevTools offen. Dort tauchen deine Anfragen ebenfalls auf.'),
    },
    {
      typ: 'aufgabe',
      id: 'k5-get',
      titel: 'GET: Notizen lesen',
      html: `<p>Öffne die Werkstatt mit der Vorlage unten und schicke die Anfrage ${m('GET')} <code>/api/notizen</code> ab. Schau dir die Antwort an: Wie viele Notizen gibt es gerade?</p>`,
      vorlage: findeVorlage('Notizen lesen'),
      pruefung: { art: 'erfolg', erfolg: 'notizen_gelesen' },
      xp: 15,
      danach: `<p>Die Antwort ist eine <strong>Liste</strong> (erkennbar an den eckigen Klammern <code>[ ]</code>). Jede Notiz hat eine <code>id</code> – ihre eindeutige Nummer, wie eine Hausnummer.</p>`,
    },
    {
      typ: 'aufgabe',
      id: 'k5-post',
      titel: 'POST: Eine Notiz anlegen',
      html: `
        <p>Jetzt legst du etwas Neues an. Dafür braucht der Server Daten – die stehen im <strong>Body</strong>. Damit der Server weiß, dass der Body im JSON-Format ist, gibt es den Header <code>Content-Type: application/json</code>.</p>
        <p>Lade die Vorlage, ändere gern Titel und Text und schicke die Anfrage ab. Achte auf den Statuscode!</p>
      `,
      vorlage: findeVorlage('Notiz anlegen'),
      render: (ziel, api) => notizbrett(ziel, api.kontext),
      pruefung: { art: 'erfolg', erfolg: 'notiz_erstellt' },
      tipps: ['Wähle in der Werkstatt die Methode <strong>POST</strong>. Im Reiter „Body“ muss das JSON stehen, im Reiter „Header“ der Content-Type.'],
      danach: `
        <p>Der Server hat mit <strong>201 Created</strong> geantwortet – „angelegt“. Schau in der Werkstatt in die <strong>Antwort-Header</strong>: Dort steht <code>Location: /api/notizen/…</code> – die Adresse deiner neuen Notiz. Die Nummer am Ende ist ihre <code>id</code>. Die brauchst du gleich.</p>
      `,
    },
    {
      typ: 'aufgabe',
      id: 'k5-aendern',
      titel: 'PUT und PATCH: Ändern',
      html: `
        <p>Zum Ändern gibt es zwei Methoden:</p>
        <ul>
          <li>${m('PUT')} <strong>ersetzt die ganze Notiz</strong>. Du musst alle Felder schicken (<code>titel</code> <em>und</em> <code>text</code>). Was fehlt, wäre danach weg – darum lehnt der Server unvollständige PUTs ab.</li>
          <li>${m('PATCH')} <strong>ändert nur, was du schickst</strong>. Willst du nur den Titel ändern, schickst du nur den Titel.</li>
        </ul>
        <p><strong>Deine Aufgabe:</strong> Ändere den Titel deiner neuen Notiz mit PATCH. Die Adresse ist <code>/api/notizen/<em>ID</em></code> – ersetze <em>ID</em> durch die Nummer deiner Notiz.</p>
      `,
      vorlagen: [
        { text: '🧰 PATCH-Vorlage öffnen', vorlage: () => ({ ...findeVorlage('Notiz ändern (PATCH)'), url: `/api/notizen/${neuesteNotizId()}` }) },
        { text: '🧰 PUT-Vorlage öffnen', vorlage: () => ({ ...findeVorlage('Notiz ersetzen (PUT)'), url: `/api/notizen/${neuesteNotizId()}` }) },
      ],
      pruefung: { art: 'erfolg', erfolg: 'notiz_geaendert' },
      tipps: [
        'Die ID siehst du auf dem Notizbrett (z. B. <code>#2</code>) oder in der Antwort deiner POST-Anfrage im Feld <code>id</code>.',
        'Bekommst du 404? Dann gibt es unter dieser ID keine Notiz – prüfe die Nummer in der Adresse.',
      ],
      danach: `<p>💡 <strong>Experiment:</strong> Schick mal ein PUT nur mit <code>titel</code>, ohne <code>text</code>. Was sagt der Server? Genau – PUT will immer alles.</p>`,
    },
    {
      typ: 'aufgabe',
      id: 'k5-delete',
      titel: 'DELETE: Löschen',
      html: `
        <p>Zum Schluss räumst du auf: Lösche eine Notiz mit ${m('DELETE')} <code>/api/notizen/<em>ID</em></code>. DELETE braucht keinen Body – die Adresse sagt alles.</p>
        <p>Schick die <strong>gleiche</strong> Anfrage danach gleich noch einmal ab. Was passiert?</p>
      `,
      vorlage: () => ({ ...findeVorlage('Notiz löschen'), url: `/api/notizen/${neuesteNotizId()}` }),
      pruefung: { art: 'erfolg', erfolg: 'notiz_geloescht' },
      danach: `
        <p>Beim ersten Mal: <strong>204 No Content</strong> – „Erledigt, ich habe nichts weiter zu sagen“. Die Antwort hat absichtlich keinen Body.</p>
        <p>Beim zweiten Mal: <strong>404 Not Found</strong> – die Notiz gibt es ja nicht mehr. Logisch!</p>
      `,
    },
    {
      typ: 'text',
      titel: 'Vorsicht beim Wiederholen',
      html: `
        <p>Manchmal geht unterwegs etwas schief und eine Anfrage wird wiederholt. Ob das schlimm ist, hängt von der Methode ab:</p>
        <ul>
          <li>${m('GET')} ist <strong>sicher</strong>: Es ändert nichts. Du kannst es so oft schicken, wie du willst.</li>
          <li>${m('PUT')} und ${m('DELETE')} sind ${g('idempotent', 'idempotent')}: Zweimal ausgeführt ist das Ergebnis dasselbe wie einmal. (Gelöscht ist gelöscht.)</li>
          <li>${m('POST')} ist <strong>nicht</strong> idempotent: Zweimal geschickt = <strong>zwei</strong> neue Einträge!</li>
        </ul>
        <p>Darum fragt dich dein Browser „Formular erneut senden?“, wenn du eine Seite nach einer Bestellung neu lädst. Er will verhindern, dass du zweimal bestellst.</p>
        ${job('Bei Schnittstellen ist das ein echtes Thema: Bricht die Verbindung nach einem POST ab, weiß man nicht, ob die Bestellung angekommen ist. Einfach nochmal senden kann zu doppelten Bestellungen oder Rechnungen führen. Gute Schnittstellen haben dafür Schutzmechanismen – man spricht von Idempotenz-Schlüsseln.')}
        ${neugierig('<p>Es gibt noch weitere Methoden: <code>HEAD</code> ist wie GET, liefert aber nur die Header (z. B. um zu prüfen, ob etwas existiert). <code>OPTIONS</code> fragt, welche Methoden erlaubt sind. Probier in der Werkstatt mal <code>OPTIONS /api/notizen/1</code> und schau in den Antwort-Header <code>Allow</code>.</p>')}
      `,
    },
    {
      typ: 'quiz',
      id: 'k5-quiz',
      fragen: [
        {
          frage: 'Mit welcher Methode liest du Daten?',
          antworten: [{ text: 'GET', richtig: true }, { text: 'POST', warum: 'POST legt etwas Neues an.' }, { text: 'DELETE', warum: 'DELETE löscht.' }],
        },
        {
          frage: 'Du willst einen neuen Kunden anlegen. Welche Methode passt?',
          antworten: [{ text: 'POST', richtig: true }, { text: 'GET', warum: 'GET liest nur.' }, { text: 'PATCH', warum: 'PATCH ändert etwas, das es schon gibt.' }],
        },
        {
          frage: 'Was ist der Unterschied zwischen PUT und PATCH?',
          antworten: [
            { text: 'PUT ersetzt alles, PATCH ändert nur die mitgeschickten Felder', richtig: true },
            { text: 'PUT löscht, PATCH legt an', warum: 'Beide ändern etwas Vorhandenes.' },
            { text: 'Es gibt keinen Unterschied', warum: 'Doch: Bei PUT musst du alle Felder schicken.' },
          ],
        },
        {
          frage: 'Welcher Header sagt dem Server, dass im Body JSON steckt?',
          antworten: [
            { text: '<code>Content-Type: application/json</code>', richtig: true },
            { text: '<code>Accept: application/json</code>', warum: 'Accept sagt, welches Format du in der ANTWORT haben möchtest.' },
            { text: '<code>Body: json</code>', warum: 'Diesen Header gibt es nicht.' },
          ],
        },
        {
          frage: 'Du schickst dieselbe POST-Anfrage aus Versehen zweimal. Was passiert wahrscheinlich?',
          antworten: [
            { text: 'Es entstehen zwei gleiche Einträge', richtig: true },
            { text: 'Der Server merkt es und ignoriert die zweite', warum: 'Nur, wenn er extra dafür gebaut ist. Normalerweise nicht.' },
            { text: 'Der erste Eintrag wird gelöscht', warum: 'Nein, POST legt einfach noch einen an.' },
          ],
        },
      ],
    },
  ],
};
