/**
 * What's already been read from the database, so going back to a tab doesn't
 * read it again. Only for showing: the database is the only source of truth.
 * Forms, calculations that get saved and printing read it directly (the
 * `leer*` / `listar*` of `src/db`), never from here.
 *
 * Only `src/db` uses this: its `ver*` read through it, and every write forgets
 * what it changes. It lives in the module, on the client, so it lasts while
 * the app is open.
 */
const guardadas = new Map<string, Promise<unknown>>();

/** Reads `clave` once; later calls get the same answer until it's forgotten. */
export const consultaRecordada = <T>(
  clave: string,
  leer: () => Promise<T>,
): Promise<T> => {
  const guardada = guardadas.get(clave);
  if (guardada) return guardada as Promise<T>;
  const lectura = leer();
  guardadas.set(clave, lectura);
  // A failed read isn't kept, and one forgotten while it read stays forgotten.
  lectura.catch(() => {
    if (guardadas.get(clave) === lectura) guardadas.delete(clave);
  });
  return lectura;
};

/** Forgets every reading whose key starts with one of `prefijos` ("" = all). */
export const olvidarConsultas = (...prefijos: string[]) => {
  for (const clave of [...guardadas.keys()])
    if (prefijos.some((p) => clave.startsWith(p))) guardadas.delete(clave);
};
