import type { LoteConClientes } from "~/db/lotes";
import { normalizar, numeroLote, titulo } from "./textos";

/** The two things every lot needs, said the same in the quick entry and the card. */
export const FALTA_ARTICULO = "Escribí el nombre del artículo.";
export const FALTA_DUENO = "Elegí el dueño del lote.";

export type FiltroLotes = "todos" | "sin-detalles" | "sin-foto";

const POR_BLOQUE = 100;

export const sinDetalles = (lote: LoteConClientes) =>
  lote.cantidad === null &&
  lote.funciona === null &&
  lote.esNuevo === null &&
  !lote.materiales &&
  !lote.marca &&
  lote.precioBase === null &&
  !lote.imagen;

export const filtrarLotes = (
  lotes: LoteConClientes[],
  busqueda: string,
  filtro: FiltroLotes,
) => {
  const q = normalizar(busqueda);
  return lotes.filter((lote) => {
    if (filtro === "sin-detalles" && !sinDetalles(lote)) return false;
    if (filtro === "sin-foto" && lote.imagen) return false;
    if (!q) return true;
    const { nombre, duenoNombre, marca, materiales } = lote;
    return normalizar(
      `${nombre} ${duenoNombre} ${marca ?? ""} ${materiales ?? ""}`,
    ).includes(q);
  });
};

export const resumenDe = (lotes: LoteConClientes[]) => ({
  total: lotes.length,
  duenos: new Set(lotes.map((lote) => lote.duenoId)).size,
  sinDetalles: lotes.filter(sinDetalles).length,
  sinFoto: lotes.filter((lote) => !lote.imagen).length,
  proximo: (lotes.at(-1)?.numero ?? 0) + 1,
});

/** Owners of the latest lots, most recent first and without repeating. */
/** The quick entry offers this many recent owners, with Ctrl 1 to 5. */
const DUENOS_RECIENTES = 5;

export const ultimosDuenos = (
  lotes: LoteConClientes[],
  cuantos = DUENOS_RECIENTES,
) => {
  const duenos: LoteConClientes[] = [];
  for (let i = lotes.length - 1; i >= 0 && duenos.length < cuantos; i--) {
    if (!duenos.some((lote) => lote.duenoId === lotes[i].duenoId)) {
      duenos.push(lotes[i]);
    }
  }
  return duenos.map(({ duenoId, duenoNombre }) => ({
    id: duenoId,
    nombre: titulo(duenoNombre),
  }));
};

export const cuentasPorDueno = (lotes: LoteConClientes[]) => {
  const cuentas: Record<number, number> = {};
  for (const { duenoId } of lotes) cuentas[duenoId] = (cuentas[duenoId] ?? 0) + 1;
  return cuentas;
};

/** The "jump to" ranges: 001 – 100, 101 – 200... */
export const bloquesDe = (lotes: LoteConClientes[]) => {
  const ultimo = lotes.at(-1)?.numero ?? 0;
  const bloques = [];
  for (let desde = 1; desde <= ultimo; desde += POR_BLOQUE) {
    const hasta = Math.min(desde + POR_BLOQUE - 1, ultimo);
    bloques.push({
      desde,
      hasta,
      rango: `${numeroLote(desde)} - ${numeroLote(hasta)}`,
      cuenta: lotes.filter((l) => l.numero >= desde && l.numero <= hasta).length,
    });
  }
  return bloques;
};

export const distintos = (valores: (string | null)[]) =>
  [...new Set(valores.filter((valor): valor is string => !!valor))].sort(
    (a, b) => a.localeCompare(b, "es"),
  );

/** The list after saving `lote`: `editarLote` also gives the lots sold with it its buyer. */
export const conLoteGuardado = (
  lotes: LoteConClientes[],
  lote: LoteConClientes,
) => {
  const { numero, compradorId, compradorNombre } = lote;
  return lotes.map((l) =>
    l.numero === numero
      ? lote
      : l.vendidoCon === numero && compradorId !== null
        ? { ...l, compradorId, compradorNombre }
        : l,
  );
};
