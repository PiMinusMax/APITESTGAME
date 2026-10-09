import { g, job, merke } from '../ui.js';
import { restaurant } from '../komponenten/restaurant.js';

export default {
  id: 'schnittstelle',
  icon: '🔌',
  titel: 'Was ist eine Schnittstelle?',
  untertitel: 'Steckdosen, Kellner und Programme, die miteinander reden.',
  ziele: [
    'Was eine Schnittstelle im Alltag und in der IT ist',
    'Was die Abkürzung <strong>API</strong> bedeutet',
    'Warum Firmen Schnittstellen brauchen – und was dein späterer Job damit zu tun hat',
  ],
  merksaetze: [
    'Eine <strong>Schnittstelle</strong> ist eine vereinbarte Übergabestelle zwischen zwei Systemen.',
    'Eine <strong>API</strong> (Programmierschnittstelle) ist eine Schnittstelle, über die <em>Programme</em> miteinander reden.',
    'Beide Seiten müssen nur die Vereinbarung kennen, nicht das Innenleben der anderen Seite.',
    'Die Vereinbarung ist ein <strong>Vertrag</strong>: Ändert eine Seite ihn heimlich, geht etwas kaputt.',
  ],
  schritte: [
    {
      typ: 'text',
      titel: 'Willkommen! Schnittstellen sind überall',
      html: `
        <p>Du hast heute schon viele Schnittstellen benutzt – ganz ohne darüber nachzudenken:</p>
        <ul>
          <li>🔌 <strong>Die Steckdose:</strong> Du steckst einen Wasserkocher, ein Handy-Ladegerät oder eine Lampe ein. Alles funktioniert, obwohl du nicht weißt, wie das Kraftwerk arbeitet. Der Stecker hat eine festgelegte Form – und beide Seiten halten sich daran.</li>
          <li>🔋 <strong>USB-C:</strong> Maus, Handy, Bildschirm – ein Anschluss für viele Geräte, weil alle denselben Standard einhalten.</li>
          <li>📺 <strong>Die Fernbedienung:</strong> Du drückst „Lauter“. Was im Fernseher dabei elektronisch passiert, ist dir egal.</li>
        </ul>
        <p>Alle drei Beispiele haben etwas gemeinsam: Es gibt eine <strong>feste Vereinbarung</strong>, wie zwei Seiten zusammenarbeiten. Genau das ist eine ${g('schnittstelle', 'Schnittstelle')}.</p>
        ${merke('Eine <strong>Schnittstelle</strong> ist eine vereinbarte Übergabestelle, an der zwei Systeme zusammenarbeiten. Jede Seite muss nur die Vereinbarung kennen – nicht das Innenleben der anderen Seite.')}
      `,
    },
    {
      typ: 'komponente',
      titel: 'Der Klassiker: das Restaurant',
      html: `
        <p>Stell dir ein Restaurant vor. Du als Gast gehst nicht selbst in die Küche. Du sagst dem <strong>Kellner</strong>, was du möchtest – aber nur Dinge, die auf der <strong>Speisekarte</strong> stehen. Der Kellner bringt die Bestellung in die Küche und kommt mit dem Essen zurück.</p>
        <p>Probier es aus! Setz danach die <strong>Technik-Brille</strong> auf und spiel es noch einmal ab.</p>
      `,
      render: (ziel) => restaurant(ziel),
      htmlDanach: `
        <h3>Übersetzt in die IT-Welt</h3>
        <div class="tabelle-rahmen"><table class="tabelle">
          <thead><tr><th>Im Restaurant</th><th>In der IT</th></tr></thead>
          <tbody>
            <tr><td>🧑 Gast</td><td>${g('client', 'Client')} – z. B. eine App oder dein Browser</td></tr>
            <tr><td>📜 Speisekarte</td><td>API-Dokumentation – was man bestellen kann und wie</td></tr>
            <tr><td>📝 Bestellung</td><td>${g('anfrage', 'Anfrage')} (englisch: Request)</td></tr>
            <tr><td>🤵 Kellner</td><td>Die ${g('api', 'API')} – die Schnittstelle</td></tr>
            <tr><td>👩‍🍳 Küche</td><td>${g('server', 'Server')} mit den Daten und der eigentlichen Arbeit</td></tr>
            <tr><td>🍕 Das Essen</td><td>${g('antwort', 'Antwort')} (englisch: Response)</td></tr>
          </tbody>
        </table></div>
        <p>Und das Einhorn-Steak? Was nicht auf der Karte steht, kann man nicht bestellen. Eine API bietet nur ganz bestimmte, vorher festgelegte Funktionen an.</p>
      `,
    },
    {
      typ: 'text',
      titel: 'Und was ist jetzt eine API?',
      html: `
        <p><strong>API</strong> steht für <em>Application Programming Interface</em> – auf Deutsch <strong>Programmierschnittstelle</strong>. Das ist eine Schnittstelle, über die nicht Menschen, sondern <strong>Programme</strong> miteinander reden.</p>
        <p>Ein paar Beispiele, die du kennst:</p>
        <ul>
          <li>🌦️ Deine <strong>Wetter-App</strong> hat keine eigenen Wetterstationen. Sie fragt über eine API bei einem Wetterdienst nach.</li>
          <li>🛒 Ein <strong>Online-Shop</strong> fragt beim Bezahlen über eine API den Zahlungsdienst und bestellt danach über eine weitere API ein Versandetikett beim Paketdienst.</li>
          <li>🔐 „<strong>Mit Google anmelden</strong>“ – die Webseite fragt über eine API bei Google nach, ob du wirklich du bist.</li>
          <li>📦 <strong>Sendungsverfolgung</strong>: Der Shop zeigt dir den Paketstatus, den er per API vom Paketdienst holt.</li>
        </ul>
        <h3>In Unternehmen hängt alles an Schnittstellen</h3>
        <p>Eine Firma hat viele Programme: einen Shop, ein Lagersystem, eine Buchhaltung, ein Programm für den Versand. Damit eine Bestellung ohne Abtippen durchläuft, müssen die Systeme miteinander reden:</p>
        <div class="systemkette" aria-label="Bestellung fließt vom Shop über Lager und Buchhaltung zum Versand">
          <div class="system"><b>🛒</b>Online-Shop</div><span class="pfeil">⇄</span>
          <div class="system"><b>📦</b>Lager</div><span class="pfeil">⇄</span>
          <div class="system"><b>💶</b>Buchhaltung</div><span class="pfeil">⇄</span>
          <div class="system"><b>🚚</b>Versand</div>
        </div>
        <p>Jeder Doppelpfeil ist eine Schnittstelle. Fällt eine aus, bleiben Bestellungen liegen, Rechnungen werden nicht geschrieben oder Pakete nicht verschickt.</p>
        ${job('Genau hier wirst du später arbeiten: Du sorgst dafür, dass Systeme zuverlässig miteinander reden. Du klärst, welche Daten fließen, testest Verbindungen, findest Fehler und hältst alles am Laufen.')}
      `,
    },
    {
      typ: 'text',
      titel: 'Die Schnittstelle ist ein Vertrag',
      html: `
        <p>Damit zwei Systeme sich verstehen, müssen sie sich vorher einigen:</p>
        <ul>
          <li><strong>Was</strong> kann man fragen? (Welche Funktionen gibt es?)</li>
          <li><strong>Wie</strong> muss die Frage aussehen? (Welche Angaben, welches Format?)</li>
          <li><strong>Was</strong> kommt zurück? (Welche Daten, welche Fehlermeldungen?)</li>
        </ul>
        <p>Diese Einigung nennt man den <strong>Schnittstellen-Vertrag</strong>. Er steht in der Dokumentation – unserer Speisekarte.</p>
        <p>Ein typisches Problem aus der Praxis: Das Lager-Team benennt ein Feld von <code>plz</code> in <code>postleitzahl</code> um und sagt niemandem Bescheid. Der Shop schickt weiter <code>plz</code> – und plötzlich werden keine Bestellungen mehr verschickt. 💥</p>
        ${merke('Schnittstellen funktionieren nur, wenn sich <strong>beide Seiten an den Vertrag halten</strong>. Änderungen müssen abgesprochen werden.')}
        ${job(`Typische Aufgaben im Schnittstellen-Bereich:
          <ul>
            <li>Anforderungen klären: Welche Daten braucht wer, wann und in welchem Format?</li>
            <li>${g('mapping', 'Mapping')}: festlegen, welches Feld im einen System zu welchem Feld im anderen gehört</li>
            <li>Schnittstellen testen – genau das übst du in diesem Spiel</li>
            <li>Fehler analysieren, wenn etwas hängt („Warum kam die Bestellung nicht an?“)</li>
            <li>Dokumentation lesen und schreiben</li>
          </ul>`)}
      `,
    },
    {
      typ: 'quiz',
      id: 'k1-quiz',
      fragen: [
        {
          frage: 'Was beschreibt eine Schnittstelle am besten?',
          antworten: [
            { text: 'Eine vereinbarte Übergabestelle, über die zwei Systeme zusammenarbeiten', richtig: true },
            { text: 'Ein besonders schnelles Kabel', warum: 'Ein Kabel kann Teil einer Schnittstelle sein – entscheidend ist aber die Vereinbarung, wie beide Seiten zusammenarbeiten.' },
            { text: 'Ein Programm zum Zeichnen von Diagrammen', warum: 'Nein, es geht um die Verbindung zwischen zwei Systemen.' },
          ],
          erklaerung: 'Wichtig ist die Vereinbarung – wie beim Stecker und der Steckdose.',
        },
        {
          frage: 'Im Restaurant-Beispiel: Wer ist die API?',
          antworten: [
            { text: 'Der Kellner', richtig: true },
            { text: 'Der Gast', warum: 'Der Gast ist der Client – er stellt die Anfrage.' },
            { text: 'Die Küche', warum: 'Die Küche ist der Server, der die eigentliche Arbeit macht.' },
          ],
          erklaerung: 'Der Kellner nimmt Bestellungen an, reicht sie weiter und bringt die Antwort zurück.',
        },
        {
          frage: 'Wofür steht API?',
          antworten: [
            { text: 'Application Programming Interface', richtig: true },
            { text: 'Automatic Program Installer', warum: 'Klingt technisch, ist aber ausgedacht.' },
            { text: 'Advanced Personal Internet', warum: 'Nein – das I steht für Interface, also Schnittstelle.' },
          ],
          erklaerung: 'Auf Deutsch: Programmierschnittstelle.',
        },
        {
          frage: 'Ein Online-Shop soll Bestellungen automatisch – ohne Abtippen – ans Lager schicken. Was braucht man dafür?',
          antworten: [
            { text: 'Eine Schnittstelle zwischen Shop und Lager', richtig: true },
            { text: 'Einen größeren Bildschirm im Lager', warum: 'Damit sieht man mehr, aber die Daten fließen trotzdem nicht automatisch.' },
            { text: 'Schnelleres WLAN', warum: 'Ohne Schnittstelle wissen die Systeme gar nicht, wie sie miteinander reden sollen.' },
          ],
        },
        {
          frage: 'Das Lager benennt ein Feld um, ohne Bescheid zu sagen. Was passiert wahrscheinlich?',
          antworten: [
            { text: 'Die Verbindung geht kaputt, weil der Vertrag gebrochen wurde', richtig: true },
            { text: 'Nichts, Computer passen sich automatisch an', warum: 'Leider nicht. Programme halten sich stur an die Vereinbarung.' },
            { text: 'Der Shop wird schneller', warum: 'Nein – eher bleiben Bestellungen liegen.' },
          ],
          erklaerung: 'Darum werden Änderungen an Schnittstellen immer abgestimmt.',
        },
      ],
    },
  ],
};
