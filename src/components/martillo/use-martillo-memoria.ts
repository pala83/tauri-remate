import {
  $,
  useComputed$,
  useSignal,
  type QRL,
  type Signal,
} from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import type { DatosRemate } from "~/lib/liquidacion";
import { conCambios } from "~/lib/cambios";
import type { FiltroMartillo } from "~/lib/martillo";
import type { CamposVenta } from "~/lib/martillo-campos";
import type { BaseVenta } from "./martillo-tipos";
import { useGuardarMartillo, type FotoMartillo } from "~/store";

/** Just the sale's fields, out of anything that has them. */
const camposSin = (c: CamposVenta): CamposVenta => ({
  precio: c.precio,
  compradorId: c.compradorId,
  comisionCompra: c.comisionCompra,
  comisionVenta: c.comisionVenta,
  grupo: c.grupo,
});

type Estado = {
  foto: FotoMartillo | undefined;
  datos: Signal<DatosRemate | undefined>;
  filtro: Signal<FiltroMartillo>;
  numero: Signal<number | null>;
  precio: Signal<string>;
  compradorId: Signal<number | null>;
  comisionCompra: Signal<string>;
  comisionVenta: Signal<string>;
  grupo: Signal<number[]>;
  recientes: Signal<number[]>;
  ultimo: Signal<string | undefined>;
  base: Signal<BaseVenta | undefined>;
};

/** Keeps the lot in the hammer and its unawarded sale for coming back. */
export const useMartilloMemoria = (
  e: Estado,
  cargarLote: QRL<(n: number | null) => Promise<void>>,
) => {
  const { state } = useAppState();
  const { datos, numero, precio, compradorId, grupo, recientes, ultimo } = e;
  const { filtro, comisionCompra, comisionVenta, base } = e;
  // Only for the first load: on changing remates the hammer starts over.
  const pendiente = useSignal(e.foto);
  /** The remate whose lots are loaded, once they are. */
  const remate = useComputed$(() => (datos.value ? state.activoId : null));
  const desde = useComputed$(() => (base.value ? camposSin(base.value) : null));
  useGuardarMartillo({
    remate,
    filtro,
    numero,
    precio,
    compradorId,
    comisionCompra,
    comisionVenta,
    grupo,
    recientes,
    ultimo,
    base: desde,
  });

  /** Once `id`'s lots are in, puts back the lot and sale it had. Says if it did. */
  const volver = $(async (id: number | null) => {
    const foto = pendiente.value;
    pendiente.value = undefined;
    const lista = datos.value?.lotes ?? [];
    if (foto?.remate !== id || !lista.some((l) => l.numero === foto.numero))
      return false;
    recientes.value = foto.recientes;
    ultimo.value = foto.ultimo;
    await cargarLote(foto.numero);
    const leido = base.value;
    if (!leido || !foto.base) return true;
    // Only what the user had changed goes over what the database says now.
    const { form, base: desde } = conCambios(camposSin(leido), {
      base: foto.base,
      form: camposSin(foto),
    });
    precio.value = form.precio;
    compradorId.value = form.compradorId;
    comisionCompra.value = form.comisionCompra;
    comisionVenta.value = form.comisionVenta;
    grupo.value = form.grupo;
    base.value = { numero: foto.numero, ...desde };
    return true;
  });

  return { volver };
};
