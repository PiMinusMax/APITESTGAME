import { el, normalisiere } from '../ui.js';
import { GLOSSAR } from '../daten/glossar.js';

export function zeigeGlossar(main) {
  const sortiert = [...GLOSSAR].sort((a, b) => a.begriff.localeCompare(b.begriff, 'de'));
  const suche = el('input', { type: 'search', class: 'glossar-suche', placeholder: '🔍 Begriff suchen, z. B. Token', 'aria-label': 'Glossar durchsuchen' });
  const liste = el('dl', { class: 'glossar-liste' });
  const zeichne = () => {
    const q = normalisiere(suche.value);
    const treffer = sortiert.filter((e) => !q || normalisiere(`${e.begriff} ${e.kurz}`).includes(q));
    liste.replaceChildren(
      ...(treffer.length
        ? treffer.map((e) => el('div', { class: 'glossar-eintrag', id: `begriff-${e.id}` }, el('dt', {}, e.begriff), el('dd', {}, e.kurz)))
        : [el('p', { class: 'leise' }, 'Kein Begriff gefunden.')]),
    );
  };
  suche.addEventListener('input', zeichne);
  zeichne();
  main.replaceChildren(el('h1', {}, '📖 Glossar'), el('p', {}, `${GLOSSAR.length} Fachbegriffe rund um Schnittstellen – kurz und verständlich erklärt.`), suche, liste);
}
