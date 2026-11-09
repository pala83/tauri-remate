import { $, useComputed$, useSignal } from "@builder.io/qwik";
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
import { useFotoLotes } from "~/store";
import { useCrearDueno } from "./use-crear-dueno";
import { useLotesAcciones, type MensajeCarga } from "./use-lotes-acciones";
import { useLotesMemoria } from "./use-lotes-memoria";

export const useLotesPage = () => {
  const { state } = useAppState();
  const lotes = useSignal<LoteConClientes[]>([]);
  const clientes = useSignal<ClienteResumen[]>([]);
  const foto = useFotoLotes();
  const busqueda = useSignal(foto?.busqueda ?? "");
  const filtro = useSignal<FiltroLotes>(foto?.filtro ?? "todos");
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
  const recientes = useComputed$(() => ultimosDuenos(lotes.value));
  const cuentas = useComputed$(() => cuentasPorDueno(lotes.value));
  const virtual = usePlanillaVirtual(filas);
  const { borrador, volver } = useLotesMemoria({
    foto,
    lotes,
    remateCargado,
    busqueda,
    filtro,
    ficha,
    virtual,
  });
  const acciones = useLotesAcciones({
    volver,
    lotes,
    clientes,
    ficha,
    reciente,
    error,
    remateCargado,
    virtual,
    mensaje,
  });

  const saltar = $((desde: number) => virtual.mostrar(filas.value, desde));

  const irA = $((numero: number) => {
    busqueda.value = "";
    filtro.value = "todos";
    ficha.value = numero;
    // Without a search or filter, the sheet draws them all.
    return virtual.mostrar(lotes.value, numero);
  });

  return {
    state,
    lotes,
    clientes,
    busqueda,
    filtro,
    ficha,
    borrador,
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
    crearDueno: useCrearDueno(clientes),
  };
};

export type LotesPageState = ReturnType<typeof useLotesPage>;
