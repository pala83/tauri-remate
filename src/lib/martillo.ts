import type { LoteConClientes } from "~/db/lotes";
import { numeroLote } from "./textos";

export type FiltroMartillo = "todos" | "sin-vender" | "vendidos";

type Lote = LoteConClientes;

/** A lot is sold or it isn't; one sold with another has that lot's buyer. */
export const vendido = (lote: Lote) => lote.compradorId !== null;

/** The lots sold together with N° `numero`, whose price is on it. */
export const hijosDe = (lotes: Lote[], numero: number | null) =>
  lotes.filter((l) => l.vendidoCon === numero);

export const filtrarMartillo = (lotes: Lote[], filtro: FiltroMartillo) =>
  filtro === "todos"
    ? lotes
    : lotes.filter((l) => vendido(l) === (filtro === "vendidos"));

export const proximoSinVender = (lotes: Lote[], desde: number) =>
  lotes.find((l) => l.numero > desde && !vendido(l)) ??
  lotes.find((l) => l.numero !== desde && !vendido(l));

export const ultimosCompradores = (lotes: Lote[], cuantos: number) => {
  const ids: number[] = [];
  for (let i = lotes.length - 1; i >= 0 && ids.length < cuantos; i--) {
    const id = lotes[i].compradorId;
    if (id !== null && !ids.includes(id)) ids.push(id);
  }
  return ids;
};

export const bloquesVendidos = (lotes: Lote[], porBloque = 100) => {
  const ultimo = lotes.at(-1)?.numero ?? 0;
  const bloques = [];
  for (let desde = 1; desde <= ultimo; desde += porBloque) {
    const hasta = Math.min(desde + porBloque - 1, ultimo);
    const suyos = lotes.filter((l) => l.numero >= desde && l.numero <= hasta);
    bloques.push({
      desde,
      hasta,
      rango: `${numeroLote(desde)} - ${numeroLote(hasta)}`,
      cuenta: `${suyos.filter(vendido).length}/${suyos.length}`,
    });
  }
  return bloques;
};
