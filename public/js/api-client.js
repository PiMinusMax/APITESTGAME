// Interne Anfragen der Spielseite + Live-Verbindung zum Server (Server-Sent Events).
import { melde, server, store } from './zustand.js';

/**
 * Anfragen, die die Spielseite selbst stellt, bekommen den Header "X-Quelle: spielseite".
 * So kann der Server sie von deinen eigenen Anfragen (Konsole, Werkstatt …) unterscheiden.
 */
export async function intern(pfad, optionen = {}) {
  const header = { 'X-Quelle': 'spielseite', ...(optionen.headers ?? {}) };
  const init = { ...optionen, headers: header };
  if (optionen.json !== undefined) {
    header['Content-Type'] = 'application/json';
    init.body = JSON.stringify(optionen.json);
    delete init.json;
  }
  return fetch(pfad, init);
}

export async function aktualisiereFortschritt() {
  try {
    const res = await intern('/api/fortschritt');
    if (res.ok) store.uebernehmeServer(await res.json());
  } catch {
    /* Server gerade nicht erreichbar */
  }
}

let quelle = null;

export function verbindeLive() {
  if (quelle || typeof EventSource === 'undefined') return;
  quelle = new EventSource('/api/ereignisse');

  const lies = (e) => {
    try {
      return JSON.parse(e.data);
    } catch {
      return {};
    }
  };

  quelle.addEventListener('init', (e) => {
    const d = lies(e);
    server.verbunden = true;
    server.roboter = d.roboter;
    server.notizen = d.notizen;
    store.uebernehmeServer(d);
    melde('verbindung', { verbunden: true });
    melde('roboter', { zustand: d.roboter });
    melde('notizen', { notizen: d.notizen });
  });
  quelle.addEventListener('erfolg', (e) => store.neuerErfolg(lies(e).name));
  quelle.addEventListener('statuscode', (e) => store.neuerStatuscode(lies(e).code));
  quelle.addEventListener('roboter', (e) => {
    const d = lies(e);
    server.roboter = d.zustand;
    melde('roboter', d);
  });
  quelle.addEventListener('notizen', (e) => {
    const d = lies(e);
    server.notizen = d.notizen;
    melde('notizen', d);
  });
  quelle.addEventListener('anfrage', (e) => {
    const d = lies(e);
    server.protokoll = [d, ...server.protokoll].slice(0, 60);
    melde('anfrage', d);
  });
  quelle.addEventListener('error', () => {
    if (server.verbunden) {
      server.verbunden = false;
      melde('verbindung', { verbunden: false });
    }
  });

  // Falls die Live-Verbindung einmal hakt: beim Zurückkehren auf die Seite nachfragen.
  window.addEventListener('focus', aktualisiereFortschritt);
}
