// Alles rund um die Konsole der DevTools: Begrüßung, Codewort und das Hilfsobjekt `spiel`.
import { server, store } from './zustand.js';
import { KAPITEL } from './kapitel/index.js';
import { holeCodewort } from './codewort.js';

const S_TITEL = 'font-size:18px;font-weight:800;color:#3b5bdb';
const S_TEXT = 'font-size:13px;line-height:1.6';
const S_CODE = 'font-size:13px;font-family:monospace;background:#e7ecff;color:#2f49b5;padding:2px 6px;border-radius:4px';
const S_WARN = 'font-size:12px;color:#c92a2a;font-weight:700';
const S_WORT = 'font-size:16px;font-weight:900;color:#f08c00';

export function begruessung() {
  console.log('%c🛰️ Mission Schnittstelle', S_TITEL);
  console.log(
    '%cHallo! Schön, dass du die Konsole gefunden hast. 👋\nDein Codewort für die Aufgabe in Kapitel 4 lautet: %c%s',
    S_TEXT,
    S_WORT,
    holeCodewort(),
  );
  console.log('%cTippe %cspiel.hilfe()%c und drücke Enter, um zu sehen, was du hier tun kannst.', S_TEXT, S_CODE, S_TEXT);
  console.log('%c⚠️ Füge hier niemals Code ein, den du nicht verstehst oder von Fremden bekommen hast!', S_WARN);
}

function offeneAufgabe() {
  const id = location.hash.match(/^#\/kapitel\/([\w-]+)/)?.[1];
  const kapitel = KAPITEL.find((k) => k.id === id);
  if (!kapitel) return null;
  const s = kapitel.schritte.find((x, i) => x.typ === 'aufgabe' && !store.istErledigt(x.id) && i <= store.schritt(kapitel.id));
  return s ? { kapitel, aufgabe: s } : null;
}

const ohneHtml = (html) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');

export function installiereSpiel(kontext) {
  const spiel = {
    hilfe() {
      console.log('%c🛰️ Befehle für die Konsole', S_TITEL);
      console.table({
        'spiel.hallo()': 'Sag Hallo – erste Konsolen-Aufgabe',
        'spiel.status()': 'Zeigt deine XP, deinen Rang und deinen Fortschritt',
        'spiel.tipp()': 'Gibt dir einen Tipp für die aktuelle Aufgabe',
        'spiel.roboter()': 'Spickzettel: So steuerst du Roboter Bit',
        'spiel.beispiele()': 'Beispiele für fetch-Anfragen zum Kopieren',
        'spiel.werkstatt()': 'Öffnet die Anfrage-Werkstatt',
        'spiel.id': 'Deine Spieler-ID',
      });
      return '✨ Viel Spaß beim Ausprobieren!';
    },

    hallo() {
      const neu = store.merkeKonsoleHallo();
      console.log('%c👋 Hallo zurück%s!', S_TITEL, store.daten.name ? `, ${store.daten.name}` : '');
      console.log('%cDu hast gerade eine JavaScript-Funktion aufgerufen. Die Klammern () bedeuten: „Führ das jetzt aus!“', S_TEXT);
      return neu ? '✅ Aufgabe erledigt – schau mal auf die Seite!' : '✅ Das hattest du schon geschafft.';
    },

    status() {
      const d = store.daten;
      const rang = store.rang();
      const naechster = store.naechsterRang();
      const fertig = KAPITEL.filter((k) => store.kapitelFertig(k.id)).length;
      console.log('%c📊 Dein Spielstand', S_TITEL);
      console.table({
        Name: d.name || '(noch kein Name)',
        XP: d.xp,
        Rang: `${rang.icon} ${rang.titel}`,
        'Nächster Rang': naechster ? `${naechster.titel} ab ${naechster.ab} XP` : '– du bist ganz oben! –',
        Kapitel: `${fertig} von ${KAPITEL.length} abgeschlossen`,
        'Gesammelte Statuscodes': [...server.statuscodes].sort().join(', ') || '–',
      });
      return `${rang.icon} ${d.xp} XP`;
    },

    tipp() {
      const offen = offeneAufgabe();
      if (!offen) return 'Gerade ist keine Aufgabe offen. Öffne ein Kapitel und mach dort weiter!';
      const { aufgabe } = offen;
      console.log('%c💡 Tipp für: %s', S_TITEL, aufgabe.titel);
      if (!aufgabe.tipps?.length) return 'Für diese Aufgabe gibt es keinen Tipp – lies die Beschreibung auf der Seite noch einmal genau.';
      aufgabe.tipps.forEach((t, i) => console.log(`%c${i + 1}. ${ohneHtml(t)}`, S_TEXT));
      return '🍀 Du schaffst das!';
    },

    roboter() {
      console.log('%c🤖 Roboter Bit steuern', S_TITEL);
      console.log(`%c// Bit bewegen (richtung: oben, unten, links, rechts · schritte: 1–10)
await fetch("/api/roboter/bewegen", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ richtung: "rechts", schritte: 2 })
});

// Farbe oder Name ändern
await fetch("/api/roboter", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ farbe: "lila" })
});

// Bit etwas sagen lassen
await fetch("/api/roboter/sprechen", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Hallo Welt!" })
});

// Neues Level starten
await fetch("/api/roboter/neustart", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ level: 2 })
});`, 'font-family:monospace;font-size:12px');
      return '🤖 Bit wartet auf deine Befehle!';
    },

    beispiele() {
      console.log('%c📨 fetch-Beispiele', S_TITEL);
      console.log(`%c// Daten lesen (GET)
await (await fetch("/api/hallo")).json()

// Wetter mit Query-Parameter
await (await fetch("/api/wetter?stadt=Hamburg")).json()

// Etwas anlegen (POST)
await fetch("/api/notizen", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ titel: "Aus der Konsole", text: "Hallo!" })
});`, 'font-family:monospace;font-size:12px');
      return '📋 Kopieren, anpassen, Enter!';
    },

    werkstatt() {
      kontext.werkstatt.oeffnen();
      return '🧰 Die Werkstatt ist offen.';
    },

    alleKapitelFreischalten() {
      store.setzeAlleFrei(true);
      console.log('%c🔓 Alle Kapitel sind freigeschaltet (Lehrkraft-Modus).', S_TITEL);
      return 'Rückgängig machen: spiel.kapitelSperren()';
    },

    kapitelSperren() {
      store.setzeAlleFrei(false);
      return '🔒 Kapitel werden wieder der Reihe nach freigeschaltet.';
    },

    get id() {
      return server.spielerId ?? '(noch nicht verbunden)';
    },
  };
  Object.defineProperty(window, 'spiel', { value: Object.freeze(spiel), configurable: true });
}
