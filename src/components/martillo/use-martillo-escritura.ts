import { $ } from "@builder.io/qwik";
import { escribirVentas, soltarPagos, type VentaLote } from "~/db/ventas";
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

export const useMartilloEscritura = (m: MartilloState) => {
  /** Saves the change and keeps what "Deshacer" needs to put it back. */
  const escribir = $(
    async (numero: number, ventas: VentaLote[], soltar: number[]) => {
      const remateId = m.state.activoId!;
      const antes = ventasDe(
        m.lotes.value,
        ventas.map((v) => v.numero),
      );
      const pagos = soltar.length ? await soltarPagos(remateId, soltar) : [];
      await escribirVentas(remateId, ventas);
      m.deshacer.value = { ventas: antes, pagos, numero };
      await m.leer();
    },
  );

  const fallar = $((err: unknown) => {
    m.mensaje.value = { tipo: "error", texto: errorTxt(err) };
  });

  return { escribir, fallar };
};
