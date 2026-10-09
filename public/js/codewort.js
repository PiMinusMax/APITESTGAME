// Ein zufälliges Codewort, das die Seite in die Konsole schreibt (Aufgabe in Kapitel 4).

const WOERTER = ['KONSOLE', 'ENTDECKT', 'NETZWERK', 'SIGNAL', 'FUNKSPRUCH', 'LEUCHTTURM', 'SCHATZKARTE', 'ROENTGEN'];

/** Es bleibt pro Browser-Tab gleich – auch wenn du die Seite neu lädst. */
export function holeCodewort() {
  const schluessel = 'mission-schnittstelle:codewort';
  try {
    let wort = sessionStorage.getItem(schluessel);
    if (!wort) {
      wort = WOERTER[Math.floor(Math.random() * WOERTER.length)];
      sessionStorage.setItem(schluessel, wort);
    }
    return wort;
  } catch {
    return 'KONSOLE';
  }
}

