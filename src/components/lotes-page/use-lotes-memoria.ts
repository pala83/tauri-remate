import { $, useSignal, useTask$, type Signal } from "@builder.io/qwik";
import type { PlanillaVirtual } from "~/components/lotes-planilla/use-planilla-virtual";
import type { LoteConClientes } from "~/db/lotes";
import type { FiltroLotes } from "~/lib/lotes";
import { useGuardarLotes, type BorradorLote, type FotoLotes } from "~/store";

type Estado = {
  foto: FotoLotes | undefined;
  lotes: Signal<LoteConClientes[]>;
  remateCargado: Signal<number | null>;
  busqueda: Signal<string>;
  filtro: Signal<FiltroLotes>;
  ficha: Signal<number | null>;
  virtual: PlanillaVirtual;
};

/** Where the sheet is: kept as it's left, to find it the same on coming back. */
export const useLotesMemoria = (e: Estado) => {
  const { lotes, remateCargado: remate, busqueda, filtro } = e;
  const { ficha, virtual } = e;
  /** What the open card has unsaved. */
  const borrador = useSignal<BorradorLote | null>(null);
  // Only for the first load: on changing remates the sheet starts over.
  const pendiente = useSignal(e.foto);
  useGuardarLotes({
    remate,
    busqueda,
    filtro,
    ficha,
    borrador,
    inicio: virtual.inicio,
  });

  // A different search or filter starts again from the top of the sheet.
  useTask$(({ track }) => {
    track(() => busqueda.value);
    track(() => filtro.value);
    virtual.inicio.value = 0;
    if (virtual.caja.value) virtual.caja.value.scrollTop = 0;
  });

  // Another lot's card, or none, leaves nothing unsaved behind.
  useTask$(({ track }) => {
    const numero = track(() => ficha.value);
    if (borrador.value && borrador.value.numero !== numero)
      borrador.value = null;
  });

  /** Once `remateId`'s lots are in, goes back to where the sheet was. Says if it did. */
  const volver = $((remateId: number) => {
    const foto = pendiente.value;
    pendiente.value = undefined;
    if (foto?.remate !== remateId) return false;
    const abierta = lotes.value.some((l) => l.numero === foto.ficha);
    // The draft first: the card reads it as it opens.
    if (abierta) borrador.value = foto.borrador;
    if (abierta) ficha.value = foto.ficha;
    // `destino` leaves two rows above the one asked for.
    virtual.destino.value = { fila: foto.inicio + 2 };
    return true;
  });

  return { borrador, volver };
};
