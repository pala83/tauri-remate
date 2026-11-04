import { $, useComputed$, useSignal, useTask$ } from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import { usePlanillaVirtual } from "~/components/lotes-planilla/use-planilla-virtual";
import type { ClienteResumen } from "~/db/clientes";
import type { LoteConClientes } from "~/db/lotes";
import {
  bloquesDe,
  cuentasPorDueno,
  filtrarLotes,
  resumenDe,
  ultimosDuenos,
  type FiltroLotes,
} from "~/lib/lotes";
import { useLotesAcciones, type MensajeCarga } from "./use-lotes-acciones";

const DUENOS_RECIENTES = 5;

export const useLotesPage = () => {
  const { state } = useAppState();
  const lotes = useSignal<LoteConClientes[]>([]);
  const clientes = useSignal<ClienteResumen[]>([]);
  const busqueda = useSignal("");
  const filtro = useSignal<FiltroLotes>("todos");
  const ficha = useSignal<number | null>(null);
  const reciente = useSignal<number | null>(null);
  const mensaje = useSignal<MensajeCarga>();
  const error = useSignal<string>();
  /** The remate whose lots are loaded, once they are. */
  const remateCargado = useSignal<number | null>(null);

  const filas = useComputed$(() =>
    filtrarLotes(lotes.value, busqueda.value, filtro.value),
  );
  const resumen = useComputed$(() => resumenDe(lotes.value));
  const bloques = useComputed$(() => bloquesDe(lotes.value));
  const recientes = useComputed$(() =>
    ultimosDuenos(lotes.value, DUENOS_RECIENTES),
  );
  const cuentas = useComputed$(() => cuentasPorDueno(lotes.value));
  const virtual = usePlanillaVirtual(filas);
  const acciones = useLotesAcciones({
    lotes,
    clientes,
    ficha,
    reciente,
    error,
    remateCargado,
    virtual,
    mensaje,
  });

  // A different search or filter starts again from the top of the sheet.
  useTask$(({ track }) => {
    track(() => busqueda.value);
    track(() => filtro.value);
    virtual.inicio.value = 0;
    if (virtual.caja.value) virtual.caja.value.scrollTop = 0;
  });

  const saltar = $((desde: number) => {
    const fila = filas.value.findIndex((lote) => lote.numero >= desde);
    if (fila !== -1) virtual.destino.value = { fila };
  });

  const irA = $((numero: number) => {
    busqueda.value = "";
    filtro.value = "todos";
    ficha.value = numero;
    const fila = lotes.value.findIndex((lote) => lote.numero === numero);
    virtual.destino.value = { fila };
  });

  return {
    state,
    lotes,
    clientes,
    busqueda,
    filtro,
    ficha,
    reciente,
    mensaje,
    error,
    remateCargado,
    filas,
    resumen,
    bloques,
    recientes,
    cuentas,
    virtual,
    saltar,
    irA,
    ...acciones,
  };
};

export type LotesPageState = ReturnType<typeof useLotesPage>;
