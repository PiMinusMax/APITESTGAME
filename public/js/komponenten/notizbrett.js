import { el } from '../ui.js';
import { server, store } from '../zustand.js';

/** Zeigt die Notizen live – sobald du per API etwas änderst, sieht man es hier. */
export function notizbrett(ziel, kontext) {
  const brett = el('div', { class: 'notizbrett', 'aria-live': 'polite' });
  const zeichne = (markiereId) => {
    const notizen = server.notizen;
    if (!notizen) return brett.replaceChildren(el('p', { class: 'leise' }, 'Verbinde mit dem Server …'));
    if (!notizen.length) return brett.replaceChildren(el('p', { class: 'leise' }, '📭 Keine Notizen vorhanden. Leg mit POST eine neue an!'));
    brett.replaceChildren(
      ...notizen.map((n) =>
        el(
          'article',
          { class: `notiz${n.id === markiereId ? ' neu' : ''}` },
          el('div', { class: 'notiz-id' }, `#${n.id}`),
          el('h4', {}, n.titel),
          el('p', {}, n.text || '—'),
        ),
      ),
    );
  };
  let bekannte = new Set((server.notizen ?? []).map((n) => n.id));
  kontext.aufraeumen(
    store.abonnieren((typ) => {
      if (typ !== 'notizen') return;
      const neu = (server.notizen ?? []).find((n) => !bekannte.has(n.id));
      bekannte = new Set((server.notizen ?? []).map((n) => n.id));
      zeichne(neu?.id);
    }),
  );
  zeichne();
  ziel.append(el('div', { class: 'notizbrett-rahmen' }, el('div', { class: 'notizbrett-titel' }, '📌 Dein Notizbrett (live vom Server)'), brett));
}
