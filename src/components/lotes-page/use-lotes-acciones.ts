import { $, useVisibleTask$, type QRL, type Signal } from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import type { PlanillaVirtual } from "~/components/lotes-planilla/use-planilla-virtual";
import { verClientes, type ClienteResumen } from "~/db/clientes";
import { leerLote, verLotes, type LoteConClientes } from "~/db/lotes";
import { conLoteGuardado } from "~/lib/lotes";
import { errorTxt } from "~/lib/textos";

export type MensajeCarga = {
  tipo: "ok" | "error" | "info";
  texto: string;
  /** The lot "Deshacer" removes. */
  deshacer?: number;
};

type Estado = {
  /** Goes back to how the sheet was left; false if it wasn't this remate. */
  volver: QRL<(remateId: number) => boolean>;
  lotes: Signal<LoteConClientes[]>;
  clientes: Signal<ClienteResumen[]>;
  ficha: Signal<number | null>;
  reciente: Signal<number | null>;
  error: Signal<string | undefined>;
  remateCargado: Signal<number | null>;
  virtual: PlanillaVirtual;
  mensaje: Signal<MensajeCarga | undefined>;
};

/** Keeps the lots in memory in step with the database, one lot at a time. */
export const useLotesAcciones = (estado: Estado) => {
  const { recargar$, state } = useAppState();
  const { lotes, clientes, ficha, reciente, error } = estado;
  const { remateCargado, virtual, mensaje, volver } = estado;

  const cargar = $(async (remateId: number) => {
    try {
      const [todos, delRemate] = await Promise.all([
        verClientes(),
        verLotes(remateId),
      ]);
      // Another remate was chosen meanwhile: its own load answers.
      if (state.activoId !== remateId) return;
      clientes.value = todos;
      lotes.value = delRemate;
      error.value = undefined;
      if (!(await volver(remateId))) virtual.destino.value = { fila: "fin" };
      remateCargado.value = remateId;
    } catch (err) {
      if (state.activoId === remateId) error.value = errorTxt(err);
    }
  });

  /** Reads back the lot just saved, without reloading the whole list. */
  const agregarLote = $(async (remateId: number, numero: number) => {
    const lote = await leerLote(remateId, numero);
    lotes.value = [...lotes.value, lote];
    reciente.value = numero;
    virtual.destino.value = { fila: "fin" };
    recargar$();
    return lote;
  });

  const refrescarLote = $(async (remateId: number, numero: number) => {
    const lote = await leerLote(remateId, numero);
    lotes.value = conLoteGuardado(lotes.value, lote);
    reciente.value = numero;
  });

  const quitarLote = $((numero: number) => {
    lotes.value = lotes.value.filter((l) => l.numero !== numero);
    reciente.value = null;
    if (ficha.value === numero) ficha.value = null;
    recargar$();
  });

  // The active remate is only known in the browser, like the database.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const id = track(() => state.activoId);
    // Nothing is saved into a remate until its own lots are loaded.
    remateCargado.value = null;
    lotes.value = [];
    reciente.value = null;
    ficha.value = null;
    mensaje.value = undefined;
    if (id !== null) cargar(id);
  });

  return { agregarLote, refrescarLote, quitarLote };
};
