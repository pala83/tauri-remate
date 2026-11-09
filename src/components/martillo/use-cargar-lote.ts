import { $, type Signal } from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import type { PlanillaVirtual } from "~/components/lotes-planilla/use-planilla-virtual";
import { lotesDeVenta } from "~/db/lotes";
import type { DatosRemate } from "~/lib/liquidacion";
import { filtrarMartillo, type FiltroMartillo } from "~/lib/martillo";
import { camposDe, type CamposVenta } from "~/lib/martillo-campos";
import { errorTxt } from "~/lib/textos";
import type { BaseVenta, MensajeMartillo } from "./martillo-tipos";

type Estado = {
  datos: Signal<DatosRemate | undefined>;
  filtro: Signal<FiltroMartillo>;
  numero: Signal<number | null>;
  precio: Signal<string>;
  compradorId: Signal<number | null>;
  comisionCompra: Signal<string>;
  comisionVenta: Signal<string>;
  grupo: Signal<number[]>;
  mensaje: Signal<MensajeMartillo | undefined>;
  base: Signal<BaseVenta | undefined>;
  virtual: PlanillaVirtual;
};

/**
 * Puts a lot in the hammer, with what's saved of its sale read from the
 * database: never from the sheet on screen, since it can end up saved.
 */
export const useCargarLote = (e: Estado) => {
  const { state } = useAppState();
  const { datos, filtro, numero, precio, compradorId, grupo } = e;
  const { comisionCompra, comisionVenta, mensaje, base, virtual } = e;

  return $(async (n: number | null) => {
    numero.value = n;
    // Nothing is awarded until the fields are this lot's.
    base.value = undefined;
    const id = state.activoId;
    let campos: CamposVenta;
    try {
      campos = camposDe(
        n === null || id === null ? [] : await lotesDeVenta(id, [n]),
        n,
      );
    } catch (err) {
      mensaje.value = { tipo: "error", texto: errorTxt(err) };
      return;
    }
    // Another lot was chosen meanwhile: its own read counts.
    if (numero.value !== n) return;
    precio.value = campos.precio;
    compradorId.value = campos.compradorId;
    comisionCompra.value = campos.comisionCompra;
    comisionVenta.value = campos.comisionVenta;
    grupo.value = campos.grupo;
    base.value = { numero: n, ...campos };
    // Read from `datos`: the computed lists lag behind a change just made.
    const lista = datos.value?.lotes ?? [];
    if (n !== null)
      return virtual.mostrar(filtrarMartillo(lista, filtro.value), n);
  });
};
