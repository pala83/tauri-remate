import { $, type QRL } from "@builder.io/qwik";
import { lotesDeVenta, type LoteConClientes } from "~/db/lotes";
import { escribirVentas, type VentaLote } from "~/db/ventas";
import { ventasDe } from "~/lib/martillo-ventas";
import { errorTxt } from "~/lib/textos";
import type { MartilloState } from "./use-martillo";

export const enfocar = (id: string) => document.getElementById(id)?.focus();

/** For a lot just chosen: its fields reach the DOM on the next frame. */
export const enfocarLote = () =>
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      enfocar("r-precio");
      enfocar("r-ir-conjunto");
    }),
  );

/** The rows of a sale and the lots whose payments it releases, or why it can't be saved. */
export type Armado = { ventas: VentaLote[]; soltar: number[] } | string;

export const useMartilloEscritura = (m: MartilloState) => {
  /**
   * Reads lots `numeros` and those sold with them from the database, works
   * out the change from them with `armar`, saves it and keeps what "Deshacer"
   * needs to put it back. Returns the lots as they were.
   */
  const escribir = $(
    async (
      numero: number,
      numeros: number[],
      armar: QRL<(lotes: LoteConClientes[]) => Armado>,
    ) => {
      const remateId = m.state.activoId!;
      const lotes = await lotesDeVenta(remateId, numeros);
      const armado = await armar(lotes);
      if (typeof armado === "string") throw new Error(armado);
      const { ventas, soltar } = armado;
      const antes = ventasDe(
        lotes,
        ventas.map((v) => v.numero),
      );
      const pagos = await escribirVentas(remateId, ventas, { soltar });
      m.deshacer.value = { ventas: antes, pagos, numero };
      await m.leer();
      return lotes;
    },
  );

  const fallar = $((err: unknown) => {
    m.mensaje.value = { tipo: "error", texto: errorTxt(err) };
  });

  return { escribir, fallar };
};

export type MartilloEscritura = ReturnType<typeof useMartilloEscritura>;
