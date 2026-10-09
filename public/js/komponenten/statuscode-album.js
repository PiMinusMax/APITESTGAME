import { el } from '../ui.js';
import { store } from '../zustand.js';
import { statusInfo } from '../daten/statuscodes.js';

export const ALBUM = [
  { code: 200, hinweis: 'Jede erfolgreiche Anfrage, z. B. GET /api/hallo' },
  { code: 201, hinweis: 'Lege mit POST /api/notizen eine Notiz an (Kapitel 5).' },
  { code: 204, hinweis: 'Lösche eine Notiz mit DELETE (Kapitel 5).' },
  { code: 301, hinweis: 'Frag die alte Adresse /api/v1/hallo an. Schau danach in den Netzwerk-Tab: Wie viele Anfragen siehst du?', pflicht: true },
  { code: 400, hinweis: 'Schick eine unvollständige Anfrage, z. B. /api/wetter ganz ohne ?stadt=…', pflicht: true },
  { code: 401, hinweis: 'Versuch den Tresor zu öffnen: /api/tresor – ohne Schlüssel (Kapitel 8).' },
  { code: 403, hinweis: 'Kommt in Kapitel 8: angemeldet, aber nicht berechtigt.' },
  { code: 404, hinweis: 'Frag etwas an, das es nicht gibt, z. B. /api/einhorn', pflicht: true },
  { code: 405, hinweis: 'Benutze eine Methode, die nicht passt: DELETE /api/hallo (Werkstatt!)', pflicht: true },
  { code: 409, hinweis: 'Kommt später beim Roboter: Bewege ihn, obwohl er schon am Ziel ist.' },
  { code: 413, hinweis: 'Schick einen riesigen Body (mehr als 64 KB) – nur für Profis.' },
  { code: 415, hinweis: 'Schick POST /api/notizen mit Body, aber ohne den Header Content-Type.' },
  { code: 418, hinweis: 'Bitte die Teekanne um Kaffee: /api/teekanne', pflicht: true },
  { code: 422, hinweis: 'Schick ein Paket ohne Postleitzahl an POST /api/paket.' },
  { code: 429, hinweis: 'Hol dir ganz schnell hintereinander Kekse: /api/kekse – mehr als 3 in 10 Sekunden.', pflicht: true },
  { code: 500, hinweis: 'Ruf /api/kaputt auf – dort ist absichtlich etwas kaputt.', pflicht: true },
  { code: 503, hinweis: 'Schau mal bei /api/wartung vorbei.' },
];

export const ALBUM_PFLICHT = ALBUM.filter((a) => a.pflicht).map((a) => a.code);

export function statuscodeAlbum(ziel, kontext) {
  const gitter = el('div', { class: 'album' });
  const zaehler = el('div', { class: 'album-zaehler' });

  const zeichne = () => {
    const gesammelt = ALBUM.filter((a) => store.hatStatuscode(a.code)).length;
    const pflichtOffen = ALBUM_PFLICHT.filter((c) => !store.hatStatuscode(c)).length;
    zaehler.innerHTML = `<strong>${gesammelt} von ${ALBUM.length}</strong> Statuscodes gesammelt · ${
      pflichtOffen ? `noch <strong>${pflichtOffen}</strong> Pflicht-Sticker (★) offen` : '✅ alle Pflicht-Sticker gesammelt!'
    }`;
    gitter.replaceChildren(
      ...ALBUM.map((a) => {
        const info = statusInfo(a.code);
        const hat = store.hatStatuscode(a.code);
        return el(
          'div',
          { class: `sticker sticker-${String(a.code)[0]}${hat ? ' gesammelt' : ''}` },
          a.pflicht ? el('span', { class: 'sticker-stern', title: 'Pflicht für dieses Kapitel' }, '★') : null,
          el('div', { class: 'sticker-code' }, String(a.code)),
          el('div', { class: 'sticker-name' }, hat ? info.kurz : '???'),
          hat ? el('div', { class: 'sticker-haken' }, '✅') : el('details', { class: 'sticker-tipp' }, el('summary', {}, 'Wie?'), el('p', {}, a.hinweis)),
        );
      }),
    );
  };
  kontext.aufraeumen(store.abonnieren((typ) => ['statuscode', 'server', 'reset'].includes(typ) && zeichne()));
  zeichne();
  ziel.append(el('div', { class: 'album-rahmen' }, zaehler, gitter));
}
