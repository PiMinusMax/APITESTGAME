import { el, normalisiere } from '../ui.js';
import { store } from '../zustand.js';
import { aktualisiereFortschritt, intern } from '../api-client.js';

/**
 * Eine Aufgabe mit Prüfung. Arten der Prüfung (s.pruefung.art):
 *  - manuell:   Knopf „Erledigt“ (für Dinge, die die Seite nicht sehen kann)
 *  - lokal:     eine eigene Komponente (s.render) meldet api.erledigt()
 *  - antwort:   Eingabefeld; geprüft lokal (s.pruefung.lokal) oder vom Server (s.pruefung.server)
 *  - erfolg:    wartet, bis der Server einen Erfolg meldet (z. B. „notiz_erstellt“)
 *  - teilziele: Checkliste aus mehreren Erfolgen/Statuscodes
 */
export function renderAufgabe(container, s, { fertig, kontext }) {
  const xp = s.xp ?? 20;
  const box = el('div', { class: `aufgabe${s.optional ? ' aufgabe-optional' : ''}` });
  box.append(
    el(
      'div',
      { class: 'aufgabe-kopf' },
      el('span', { class: 'aufgabe-label' }, s.optional ? '⭐ Bonus-Aufgabe' : '🎯 Aufgabe'),
      el('span', { class: 'xp' }, `+${xp} XP`),
    ),
  );
  if (s.html) box.append(el('div', { class: 'aufgabe-text', html: s.html }));

  const extra = el('div', { class: 'aufgabe-extra' });
  const pruefBereich = el('div', { class: 'aufgabe-pruefung' });
  const tippBereich = el('div', { class: 'aufgabe-tipps' });
  const danach = s.danach ? el('div', { class: 'aufgabe-danach', html: s.danach, hidden: true }) : null;

  let erledigt = false;
  const api = {
    erledigt: () => abschliessen(),
    get istErledigt() {
      return erledigt;
    },
    kontext,
    box,
  };

  function abschliessen() {
    if (erledigt) return;
    erledigt = true;
    store.erledige(s.id, xp, s.titel ?? 'Aufgabe erledigt');
    zeigeErledigt();
    fertig();
  }

  function zeigeErledigt() {
    box.classList.add('erledigt');
    pruefBereich.innerHTML = '';
    pruefBereich.append(el('div', { class: 'aufgabe-geschafft' }, '✅ Geschafft!'));
    if (danach) danach.hidden = false;
  }

  container.append(box);
  box.append(extra);
  if (s.render) s.render(extra, api);

  // Vorlagen für die Werkstatt
  const vorlagen = s.vorlagen ?? (s.vorlage ? [{ text: '🧰 In der Werkstatt öffnen', vorlage: s.vorlage }] : []);
  if (vorlagen.length) {
    box.append(
      el(
        'div',
        { class: 'aufgabe-knoepfe' },
        vorlagen.map((v) => el('button', { type: 'button', class: 'knopf', onclick: () => kontext.werkstatt.oeffnen(typeof v.vorlage === 'function' ? v.vorlage() : v.vorlage) }, v.text)),
      ),
    );
  }

  box.append(pruefBereich, tippBereich);
  if (danach) box.append(danach);

  const p = s.pruefung ?? { art: 'manuell' };
  if (store.istErledigt(s.id)) {
    erledigt = true;
    zeigeErledigt();
    const liste = p.art === 'teilziele' ? checkliste(p) : null;
    if (liste) pruefBereich.prepend(liste);
  } else {
    ({ manuell, lokal: () => {}, antwort, erfolg, teilziele })[p.art]?.(p);
  }

  zeichneTipps();

  // ---------- Prüfarten ----------

  function manuell(p) {
    pruefBereich.append(el('button', { type: 'button', class: 'knopf knopf-primaer', onclick: abschliessen }, `✔ ${p.knopf ?? 'Erledigt'}`));
  }

  function antwort(p) {
    const feld = el('input', { type: 'text', class: 'eingabe', placeholder: p.platzhalter ?? 'Deine Antwort', 'aria-label': 'Antwort', autocomplete: 'off', spellcheck: 'false' });
    const knopf = el('button', { type: 'submit', class: 'knopf knopf-primaer' }, 'Prüfen');
    const meldung = el('div', { class: 'aufgabe-meldung', 'aria-live': 'polite' });
    const formular = el('form', { class: 'aufgabe-antwort' }, feld, knopf);
    formular.addEventListener('submit', async (e) => {
      e.preventDefault();
      const wert = feld.value.trim();
      if (!wert) return;
      knopf.disabled = true;
      let richtig = false;
      let text = p.falsch ?? 'Leider nicht richtig. Schau noch einmal genau hin.';
      if (p.lokalPruefung) {
        richtig = p.lokalPruefung(wert);
      } else if (p.lokal) {
        richtig = p.lokal.some((x) => normalisiere(x) === normalisiere(wert));
      } else {
        try {
          const res = await intern('/api/pruefen', { method: 'POST', json: { aufgabe: p.server, antwort: wert } });
          const d = await res.json();
          richtig = d.richtig;
          text = d.nachricht ?? text;
        } catch {
          text = 'Der Server ist gerade nicht erreichbar. Versuch es gleich noch einmal.';
        }
      }
      knopf.disabled = false;
      if (richtig) abschliessen();
      else {
        meldung.className = 'aufgabe-meldung nein';
        meldung.textContent = `❌ ${text}`;
      }
    });
    pruefBereich.append(formular, meldung);
  }

  function erfolg(p) {
    const status = el('div', { class: 'aufgabe-warten' }, el('span', { class: 'puls', 'aria-hidden': 'true' }), p.warteText ?? 'Warte auf deine Anfrage …');
    const neu = el('button', { type: 'button', class: 'knopf knopf-klein', onclick: aktualisiereFortschritt }, '🔄 Jetzt prüfen');
    pruefBereich.append(el('div', { class: 'aufgabe-warten-zeile' }, status, neu));
    const pruefe = () => store.hatErfolg(p.erfolg) && abschliessen();
    kontext.aufraeumen(store.abonnieren((typ) => (typ === 'erfolg' || typ === 'server') && pruefe()));
    pruefe();
  }

  function zielErreicht(ziel) {
    return ziel.statuscode ? store.hatStatuscode(ziel.statuscode) : store.hatErfolg(ziel.erfolg);
  }

  function checkliste(p) {
    if (p.versteckt) return null;
    return el(
      'ul',
      { class: 'checkliste' },
      p.ziele.map((t) => {
        const ok = zielErreicht(t);
        return el(
          'li',
          { class: ok ? 'ok' : '' },
          el('span', { class: 'haken', 'aria-hidden': 'true' }, ok ? '✅' : '⬜'),
          el('span', { html: t.text }),
          t.optional ? el('span', { class: 'optional-marke' }, 'Bonus') : null,
        );
      }),
    );
  }

  function teilziele(p) {
    const behaelter = el('div');
    const neu = el('button', { type: 'button', class: 'knopf knopf-klein', onclick: aktualisiereFortschritt }, '🔄 Jetzt prüfen');
    pruefBereich.append(behaelter, neu);
    const aktualisiere = () => {
      for (const t of p.ziele) {
        if (zielErreicht(t)) store.erledige(`${s.id}:${t.statuscode ?? t.erfolg}`, t.xp ?? 10, t.kurz ?? '');
      }
      behaelter.replaceChildren(checkliste(p) ?? '');
      if (p.ziele.filter((t) => !t.optional).every(zielErreicht)) {
        abschliessen();
        const liste = checkliste(p);
        if (liste) pruefBereich.prepend(liste);
      }
    };
    kontext.aufraeumen(store.abonnieren((typ) => ['erfolg', 'statuscode', 'server'].includes(typ) && !erledigt && aktualisiere()));
    aktualisiere();
  }

  // ---------- Tipps ----------

  function zeichneTipps() {
    const tipps = s.tipps ?? [];
    if (!tipps.length && !s.loesung) return;
    let gezeigt = 0;
    const liste = el('ol', { class: 'tipp-liste' });
    const knopf = el('button', { type: 'button', class: 'knopf knopf-leise' });
    const loesungKnopf = s.loesung ? el('button', { type: 'button', class: 'knopf knopf-leise', hidden: true }, '🔑 Lösung zeigen') : null;
    const aktualisiere = () => {
      knopf.textContent = `💡 Tipp anzeigen (${gezeigt + 1}/${tipps.length})`;
      knopf.hidden = gezeigt >= tipps.length;
      if (loesungKnopf) loesungKnopf.hidden = gezeigt < tipps.length;
    };
    knopf.addEventListener('click', () => {
      liste.append(el('li', { html: tipps[gezeigt] }));
      gezeigt++;
      aktualisiere();
    });
    loesungKnopf?.addEventListener('click', () => {
      loesungKnopf.replaceWith(el('div', { class: 'loesung', html: `<div class="box-titel">🔑 Lösung</div>${s.loesung}` }));
    });
    aktualisiere();
    tippBereich.append(liste, el('div', { class: 'tipp-knoepfe' }, knopf, loesungKnopf));
  }

  return api;
}
