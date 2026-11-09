import { $ } from "@builder.io/qwik";
import type { LoteConClientes } from "~/db/lotes";
import { ventaSeparar, ventasQuitar } from "~/lib/martillo-ventas";
import type { MartilloState } from "./use-martillo";
import { enfocar, type MartilloEscritura } from "./use-martillo-escritura";

/** Leaving a lot unsold, alone or with those sold with it. */
export const useQuitarVenta = (
  m: MartilloState,
  { escribir, fallar }: MartilloEscritura,
) => {
  const quitar = $(async () => {
    const lote = m.lote.value;
    if (!lote) return;
    const n = lote.numero;
    try {
      await escribir(
        n,
        [n],
        $((lotes: LoteConClientes[]) => ({
          ventas: ventasQuitar(lotes, n),
          soltar: [n],
        })),
      );
    } catch (err) {
      return fallar(err);
    }
    m.mensaje.value = {
      tipo: "ok",
      texto: `El N° ${lote.numero} quedó sin vender.`,
    };
    await m.cargarLote(lote.numero);
  });

  const separar = $(async () => {
    const lote = m.lote.value;
    if (!lote) return;
    const n = lote.numero;
    try {
      await escribir(
        n,
        [n],
        $((lotes: LoteConClientes[]) => {
          const l = lotes.find((x) => x.numero === n);
          if (!l) return `No se encontró el lote N° ${n}.`;
          return { ventas: ventaSeparar(l), soltar: [] };
        }),
      );
    } catch (err) {
      return fallar(err);
    }
    m.mensaje.value = {
      tipo: "ok",
      texto: `El N° ${lote.numero} se separó del conjunto y quedó sin vender.`,
    };
    await m.cargarLote(lote.numero);
    enfocar("r-precio");
  });

  return { quitar, separar };
};
