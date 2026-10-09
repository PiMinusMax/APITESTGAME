export const STATUSCODES = {
  200: { name: 'OK', kurz: 'Alles gut', erklaerung: 'Die Anfrage hat geklappt. Die Antwort enthält die gewünschten Daten.' },
  201: { name: 'Created', kurz: 'Angelegt', erklaerung: 'Etwas Neues wurde erfolgreich erstellt – typisch nach POST.' },
  204: { name: 'No Content', kurz: 'Erledigt, ohne Inhalt', erklaerung: 'Hat geklappt, die Antwort ist aber absichtlich leer – typisch nach DELETE.' },
  301: { name: 'Moved Permanently', kurz: 'Dauerhaft umgezogen', erklaerung: 'Die Ressource hat eine neue Adresse (Header „Location“). Browser folgen automatisch.' },
  302: { name: 'Found', kurz: 'Vorübergehend woanders', erklaerung: 'Gerade unter einer anderen Adresse zu finden.' },
  304: { name: 'Not Modified', kurz: 'Unverändert', erklaerung: 'Deine zwischengespeicherte Version ist noch aktuell.' },
  400: { name: 'Bad Request', kurz: 'Fehlerhafte Anfrage', erklaerung: 'Mit deiner Anfrage stimmt etwas nicht – z. B. fehlende oder falsche Daten.' },
  401: { name: 'Unauthorized', kurz: 'Nicht angemeldet', erklaerung: 'Der Server weiß nicht, wer du bist: Schlüssel oder Token fehlt oder ist ungültig.' },
  403: { name: 'Forbidden', kurz: 'Verboten', erklaerung: 'Der Server weiß, wer du bist – aber du darfst das nicht.' },
  404: { name: 'Not Found', kurz: 'Nicht gefunden', erklaerung: 'Unter dieser Adresse gibt es nichts.' },
  405: { name: 'Method Not Allowed', kurz: 'Methode nicht erlaubt', erklaerung: 'Die Adresse gibt es, aber nicht mit dieser Methode (z. B. DELETE statt GET).' },
  408: { name: 'Request Timeout', kurz: 'Zu langsam', erklaerung: 'Die Anfrage kam nicht schnell genug vollständig beim Server an.' },
  409: { name: 'Conflict', kurz: 'Konflikt', erklaerung: 'Passt nicht zum aktuellen Zustand – z. B. schon erledigt oder falsche Reihenfolge.' },
  413: { name: 'Content Too Large', kurz: 'Zu groß', erklaerung: 'Der Body ist zu groß für den Server.' },
  415: { name: 'Unsupported Media Type', kurz: 'Falsches Format', erklaerung: 'Der Server versteht das Format im Body nicht – oft fehlt der Header Content-Type.' },
  418: { name: "I'm a teapot", kurz: 'Ich bin eine Teekanne', erklaerung: 'Ein Aprilscherz von 1998, den es bis heute gibt. 🫖' },
  422: { name: 'Unprocessable Content', kurz: 'Inhalt nicht verarbeitbar', erklaerung: 'Das Format stimmt, aber der Inhalt ist unvollständig oder ergibt keinen Sinn.' },
  429: { name: 'Too Many Requests', kurz: 'Zu viele Anfragen', erklaerung: 'Langsam! Limit erreicht. Der Header „Retry-After“ sagt, wie lange du warten sollst.' },
  500: { name: 'Internal Server Error', kurz: 'Serverfehler', erklaerung: 'Auf dem Server ist etwas schiefgelaufen. Meist nicht deine Schuld.' },
  502: { name: 'Bad Gateway', kurz: 'Gateway-Fehler', erklaerung: 'Ein Vermittler-Server hat vom eigentlichen Server eine kaputte Antwort bekommen.' },
  503: { name: 'Service Unavailable', kurz: 'Nicht verfügbar', erklaerung: 'Der Dienst ist gerade überlastet oder in Wartung.' },
  504: { name: 'Gateway Timeout', kurz: 'Zeitüberschreitung', erklaerung: 'Ein Vermittler-Server hat zu lange auf eine Antwort gewartet.' },
};

const KLASSEN = {
  1: { name: 'Information', emoji: 'ℹ️' },
  2: { name: 'Erfolg', emoji: '✅' },
  3: { name: 'Umleitung', emoji: '↪️' },
  4: { name: 'Fehler beim Client', emoji: '🙋' },
  5: { name: 'Fehler beim Server', emoji: '🔥' },
};

export function statusInfo(code) {
  const klasse = KLASSEN[String(code)[0]] ?? { name: 'Unbekannt', emoji: '❔' };
  return { code, klasse, ...(STATUSCODES[code] ?? { name: '', kurz: klasse.name, erklaerung: '' }) };
}
