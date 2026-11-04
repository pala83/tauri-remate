import type { ClienteResumen } from "~/db/clientes";
import { lotesTxt, normalizar, textoCliente, titulo } from "~/lib/textos";

const MAX_RESULTADOS = 7;

export type OpcionDueno = {
  clave: string;
  texto: string;
  info: string;
  /** The client's id, or null when the option creates one. */
  id: number | null;
  /** Name for the new client. */
  nombre: string;
};

/** The chosen client's name, as the field shows it. */
export const nombreDe = (clientes: ClienteResumen[], id: number | null) =>
  titulo(clientes.find((c) => c.id === id)?.nombre ?? "");

const coincide = (nombre: string, q: string) => {
  const palabras = nombre.split(" ");
  return (
    nombre.includes(q) ||
    q.split(" ").every((t) => palabras.some((p) => p.startsWith(t)))
  );
};

export const opcionesDe = (
  clientes: ClienteResumen[],
  recientes: number[],
  cuentas: Record<number, number>,
  busqueda: string,
): OpcionDueno[] => {
  const opcion = (cliente: ClienteResumen): OpcionDueno => ({
    clave: String(cliente.id),
    texto: titulo(cliente.nombre),
    info: cuentas[cliente.id] ? lotesTxt(cuentas[cliente.id]) : "",
    id: cliente.id,
    nombre: cliente.nombre,
  });

  const q = normalizar(busqueda);
  if (!q) {
    return recientes.flatMap((id) => {
      const cliente = clientes.find((c) => c.id === id);
      return cliente ? [opcion(cliente)] : [];
    });
  }

  const nombres = clientes.map((c) => ({ c, n: normalizar(c.nombre) }));
  const opciones = nombres
    .filter(({ n }) => coincide(n, q))
    .sort(
      (a, b) =>
        Number(b.n.startsWith(q)) - Number(a.n.startsWith(q)) ||
        a.c.nombre.localeCompare(b.c.nombre, "es"),
    )
    .slice(0, MAX_RESULTADOS)
    .map(({ c }) => opcion(c));

  if (nombres.some(({ n }) => n === q)) return opciones;
  const nombre = textoCliente(busqueda);
  return [
    ...opciones,
    {
      clave: "nuevo",
      texto: `Cliente nuevo: «${titulo(nombre)}»`,
      info: "alta",
      id: null,
      nombre,
    },
  ];
};
