/** Erstellt eine Route. Muster wie "/api/notizen/:id" werden zu regulären Ausdrücken. */
export function route(methode, muster, handler) {
  const schluessel = [];
  const quelle = muster.replace(/[.*+?^${}()|[\]\\]/g, (z) => (z === ':' ? z : `\\${z}`));
  const regex = new RegExp(
    `^${quelle.replace(/:(\w+)/g, (_, name) => {
      schluessel.push(name);
      return '([^/]+)';
    })}$`,
  );
  return { methode, muster, regex, schluessel, handler };
}

export function parameterAus(r, pfad) {
  const treffer = pfad.match(r.regex);
  const params = {};
  r.schluessel.forEach((name, i) => {
    try {
      params[name] = decodeURIComponent(treffer[i + 1]);
    } catch {
      params[name] = treffer[i + 1];
    }
  });
  return params;
}
