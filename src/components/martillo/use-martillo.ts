import { useComputed$, useSignal, useTask$ } from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import { usePlanillaVirtual } from "~/components/lotes-planilla/use-planilla-virtual";
import type { ClienteResumen } from "~/db/clientes";
import type { DatosRemate } from "~/lib/liquidacion";
import { filtrarMartillo, type FiltroMartillo } from "~/lib/martillo";
import { marchaDe } from "~/lib/martillo-marcha";
import { COMISION_DEFECTO } from "~/lib/martillo-ventas";
import { campoComision } from "~/lib/textos";
import { useFotoMartillo } from "~/store";
import type { BaseVenta, Deshacer, MensajeMartillo } from "./martillo-tipos";
import { useMartilloCarga } from "./use-martillo-carga";

export const useMartillo = () => {
  const { state } = useAppState();
  const datos = useSignal<DatosRemate>();
  const clientes = useSignal<ClienteResumen[]>([]);
  const foto = useFotoMartillo();
  const filtro = useSignal<FiltroMartillo>(foto?.filtro ?? "todos");
  const numero = useSignal<number | null>(null);
  const precio = useSignal("");
  const compradorId = useSignal<number | null>(null);
  const comisionCompra = useSignal(campoComision(COMISION_DEFECTO));
  const comisionVenta = useSignal(campoComision(COMISION_DEFECTO));
  const grupo = useSignal<number[]>([]);
  const recientes = useSignal<number[]>([]);
  const ultimo = useSignal<string>();
  const mensaje = useSignal<MensajeMartillo>();
  const deshacer = useSignal<Deshacer>();
  const recien = useSignal<number | null>(null);
  /** The fields as read from the database for lot `numero`, once they are. */
  const base = useSignal<BaseVenta>();

  const lotes = useComputed$(() => datos.value?.lotes ?? []);
  const filas = useComputed$(() => filtrarMartillo(lotes.value, filtro.value));
  const virtual = usePlanillaVirtual(filas);
  const lote = useComputed$(() =>
    lotes.value.find((l) => l.numero === numero.value),
  );
  const marcha = useComputed$(() =>
    datos.value ? marchaDe(datos.value, clientes.value) : null,
  );

  useTask$(({ track }) => {
    track(() => filtro.value);
    virtual.inicio.value = 0;
    if (virtual.caja.value) virtual.caja.value.scrollTop = 0;
  });

  const { cargarLote, leer } = useMartilloCarga({
    foto,
    datos,
    clientes,
    filtro,
    numero,
    precio,
    compradorId,
    comisionCompra,
    comisionVenta,
    grupo,
    recientes,
    mensaje,
    deshacer,
    ultimo,
    recien,
    base,
    virtual,
  });

  return {
    state,
    datos,
    clientes,
    filtro,
    numero,
    precio,
    compradorId,
    comisionCompra,
    comisionVenta,
    grupo,
    recientes,
    ultimo,
    mensaje,
    deshacer,
    recien,
    base,
    lotes,
    filas,
    virtual,
    lote,
    marcha,
    cargarLote,
    leer,
  };
};

export type MartilloState = ReturnType<typeof useMartillo>;
