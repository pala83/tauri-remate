import { $, useVisibleTask$, type Signal } from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import type { PlanillaVirtual } from "~/components/lotes-planilla/use-planilla-virtual";
import {
  crearCliente,
  listarClientes,
  type ClienteResumen,
} from "~/db/clientes";
import { leerLote, listarLotes, type LoteConClientes } from "~/db/lotes";
import { errorTxt } from "~/lib/textos";

export type MensajeCarga = {
  tipo: "ok" | "error" | "info";
  texto: string;
  /** The lot "Deshacer" removes. */
  deshacer?: number;
};

type Estado = {
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
  const { remateCargado, virtual, mensaje } = estado;

  const cargar = $(async (remateId: number) => {
    try {
      clientes.value = await listarClientes();
      lotes.value = await listarLotes(remateId);
      error.value = undefined;
      virtual.destino.value = { fila: "fin" };
      remateCargado.value = remateId;
    } catch (err) {
      error.value = errorTxt(err);
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
    lotes.value = lotes.value.map((l) => (l.numero === numero ? lote : l));
    reciente.value = numero;
  });

  const quitarLote = $((numero: number) => {
    lotes.value = lotes.value.filter((l) => l.numero !== numero);
    reciente.value = null;
    if (ficha.value === numero) ficha.value = null;
    recargar$();
  });

  const crearDueno = $(async (nombre: string) => {
    const id = await crearCliente({ nombre });
    clientes.value = await listarClientes();
    return id;
  });

  // The active remate is only known in the browser, like the database.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const id = track(() => state.activoId);
    ficha.value = null;
    mensaje.value = undefined;
    if (id !== null) cargar(id);
  });

  return { agregarLote, refrescarLote, quitarLote, crearDueno };
};
