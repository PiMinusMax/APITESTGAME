# 🛰️ Mission Schnittstelle – das API-Lernspiel

Ein Lernspiel im Browser für **absolute Einsteigerinnen und Einsteiger** ohne IT-Vorkenntnisse – z. B. Studierende im ersten Semester, die später im Schnittstellen-Bereich arbeiten sollen.

Schritt für Schritt lernen die Spielenden:

- was eine **Schnittstelle / API** ist und warum Unternehmen sie brauchen,
- wie **HTTP** funktioniert (Anfrage und Antwort, Methoden, URLs, Header, Body, Statuscodes),
- **JSON** und **XML** zu lesen, zu schreiben und zu reparieren,
- mit den **Entwicklerwerkzeugen (DevTools)** des Browsers zu arbeiten: Netzwerk-Tab, Konsole, Cookies,
- **echte Anfragen** zu schreiben – mit einer eingebauten „Werkstatt“, mit `fetch` in der Konsole und mit `curl`,
- **REST**, **SOAP** (mit WSDL) und **GraphQL** zu benutzen und weitere Arten (Webhooks, Queues, EDI, Dateischnittstellen …) einzuordnen,
- sicher mit **API-Keys und Tokens** umzugehen,
- und zum Abschluss einen **Integrationsauftrag** über drei Systeme durchzuziehen.

Hinter dem Spiel steckt eine **echte HTTP-API**. Alles, was die Spielenden schicken, kommt wirklich beim Server an – und die Spielseite reagiert live darauf (z. B. bewegt sich Roboter „Bit“, wenn man ihm aus der Konsole Befehle schickt).

## Die 13 Kapitel

| # | Kapitel | Praxis |
|---|---------|--------|
| 1 | Was ist eine Schnittstelle? | Restaurant-Animation (Gast · Kellner · Küche) |
| 2 | Anfrage und Antwort | Erste echte Anfrage mit Animation |
| 3 | URLs und Endpunkte | URL-Zerlegung, Query-Parameter, Adressleiste als Client |
| 4 | Die Entwicklerwerkzeuge | 4 Geheimaufträge im Netzwerk-Tab, Konsole und Cookies |
| 5 | HTTP-Methoden | CRUD mit der Werkstatt, Live-Notizbrett |
| 6 | Statuscodes | Statuscode-Sammelalbum (Codes selbst provozieren) |
| 7 | JSON und XML | JSON lesen, reparieren, Steckbrief an die API schicken |
| 8 | Header und Anmeldung | Accept-Header, API-Key, Login, Bearer-Token, 401 vs. 403 |
| 9 | Die Konsole | `fetch`, Roboter Bit über 3 Level steuern, „Als fetch kopieren“ |
| 10 | REST | API-Design, Filter, Paginierung, Detektiv-Auftrag, OpenAPI, curl |
| 11 | SOAP | WSDL lesen, SOAP-Anfrage, SOAP-Fault |
| 12 | GraphQL & die Schnittstellen-Familie | GraphQL-Abfragen, Server-Sent Events in den DevTools, echte öffentliche API |
| 13 | Abschlussmission | Token → Auftrag (REST) → Lager (SOAP) → Lieferung (REST) |

Dazu gibt es ein **API-Handbuch**, ein **Glossar** mit über 60 Begriffen (auch als Tooltips im Text), XP, Ränge und am Ende eine **druckbare Urkunde**.

## Schnellstart

Voraussetzung: [Node.js](https://nodejs.org/) ab Version 18.17. Es gibt **keine weiteren Abhängigkeiten** – kein `npm install` nötig.

```bash
npm start
# → http://localhost:3000
```

Für die Entwicklung mit automatischem Neustart: `npm run dev`. Tests: `npm test`.

## Auf eine Website bringen

Das Spiel braucht einen kleinen **Node.js-Server**, weil die Übungs-API echt ist. Reines Static Hosting (z. B. GitHub Pages) reicht deshalb **nicht**.

**Docker** (überall, wo Container laufen):

```bash
docker build -t mission-schnittstelle .
docker run -p 3000:3000 mission-schnittstelle
```

**Render.com:** Die Datei `render.yaml` ist ein fertiger Blueprint. Im Render-Dashboard „New → Blueprint“ wählen und dieses Repository verbinden.

**Jeder andere Node-Host** (Railway, Fly.io, eigener Server …): Startbefehl `node server.js`, Port über die Umgebungsvariable `PORT`.

Wichtig für den Betrieb:

- Der Server hält den Spielzustand **im Arbeitsspeicher** (keine Datenbank). Deshalb nur **eine Instanz** betreiben. Nach einem Neustart sind Notizen, Roboter-Position usw. zurückgesetzt – der Lernfortschritt bleibt im Browser der Spielenden erhalten.
- Die Seite sollte über **HTTPS** erreichbar sein (bei Render & Co. automatisch).
- Live-Updates laufen über Server-Sent Events. Ein vorgeschalteter Proxy darf `/api/ereignisse` nicht puffern (für nginx: `proxy_buffering off;`).

| Umgebungsvariable | Standard | Bedeutung |
|---|---|---|
| `PORT` | `3000` | Port des Servers |
| `HOST` | `0.0.0.0` | Netzwerk-Schnittstelle |
| `JWT_SECRET` | zufällig pro Start | Geheimnis für die Übungs-Tokens |
| `MAX_SPIELER` | `20000` | Wie viele Spielstände der Server höchstens im Speicher hält |

## Für Lehrkräfte

- **Alle Kapitel freischalten:** In der Konsole der DevTools `spiel.alleKapitelFreischalten()` eingeben (rückgängig: `spiel.kapitelSperren()`). Normalerweise wird ein Kapitel erst nach dem vorherigen freigeschaltet.
- **Spielstand zurücksetzen:** auf der Startseite (unten) oder über die DevTools (Anwendung → Lokaler Speicher).
- Alle Daten im Spiel (Kunden, Bestellungen, Wetter …) sind **ausgedacht**.
- **Datenschutz:** Es gibt keine Anmeldung und keine Datenbank. Der eingegebene Name bleibt im Browser. Der Server kennt nur eine zufällige Spieler-ID (Cookie) und vergisst inaktive Spielstände nach 48 Stunden.
- Empfohlen: Laptop/PC mit **Chrome, Edge oder Firefox**. Die ersten Kapitel funktionieren auch am Handy, die DevTools-Aufgaben nicht.
- Die Konsole bietet Hilfen: `spiel.hilfe()`, `spiel.tipp()`, `spiel.status()`, `spiel.roboter()`.
- Für Werkzeuge außerhalb des Browsers (curl, Postman) wird die Spieler-ID im Header `X-Spieler-ID` mitgeschickt. Die Werkstatt erzeugt passende curl-Befehle automatisch.

## Projektaufbau

```
server.js              Einstieg: HTTP-Server (API + statische Dateien)
src/
  api.js               Router für /api, /soap und /graphql
  kontext.js           Anfrage-Kontext, JSON-Body lesen, Antworten senden
  spieler.js           Spielstände im Speicher + Live-Ereignisse (SSE)
  routen/*.js          Die Endpunkte (Notizen, Sicherheit, Roboter, Firma, SOAP, GraphQL, Mission …)
  graphql.js           Kleine GraphQL-Umsetzung (Abfragen, Variablen, Aliase)
  daten.js             Übungsdaten des Shops
public/
  index.html, css/style.css
  js/main.js           Navigation, Routing, Kopfzeile, Tooltips, Live-Ticker
  js/kapitel/*.js      Die 13 Kapitel (Texte, Aufgaben, Quizze)
  js/komponenten/*.js  Interaktive Bausteine (Werkstatt-Aufgaben, Roboter, Album …)
  js/werkstatt.js      Die Anfrage-Werkstatt
test/api.test.js       Tests der API (node:test)
```

### Inhalte erweitern

Ein Kapitel ist ein Objekt mit einer Liste von `schritte`. Jeder Schritt hat einen `typ`:

- `text` – erklärender Text (`html`)
- `komponente` – Text plus interaktiver Baustein (`render`)
- `quiz` – Fragen mit Antworten (`fragen`), falsche Antworten dürfen korrigiert werden
- `aufgabe` – eine Aufgabe mit Prüfung (`pruefung.art`):
  - `erfolg` – wartet, bis der Server einen Erfolg meldet (z. B. `notiz_erstellt`)
  - `teilziele` – Checkliste aus mehreren Erfolgen oder Statuscodes
  - `antwort` – Eingabefeld, geprüft lokal (`lokal`) oder vom Server (`server`)
  - `lokal` – eine eigene Komponente meldet „erledigt“
  - `manuell` – Knopf „Erledigt“

Erfolge vergibt der Server mit `ctx.spieler.erfolg('name')` und meldet sie live an die Seite.

## Lizenz

MIT
