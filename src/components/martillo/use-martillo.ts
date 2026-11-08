import { useComputed$, useSignal, useTask$ } from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import { usePlanillaVirtual } from "~/components/lotes-planilla/use-planilla-virtual";
import type { ClienteResumen } from "~/db/clientes";
import type { VentaLote } from "~/db/ventas";
import type { PagoLote } from "~/db/schema";
import type { DatosRemate } from "~/lib/liquidacion";
import { filtrarMartillo, type FiltroMartillo } from "~/lib/martillo";
import { marchaDe } from "~/lib/martillo-marcha";
import { COMISION_DEFECTO } from "~/lib/martillo-ventas";
import { campoComision } from "~/lib/textos";
import { useMartilloCarga } from "./use-martillo-carga";

export type MensajeMartillo = {
  tipo: "ok" | "error" | "info";
  texto: string;
};

export type Deshacer = {
  ventas: VentaLote[];
  pagos: PagoLote[];
  numero: number;
};

export const useMartillo = () => {
  const { state } = useAppState();
  const datos = useSignal<DatosRemate>();
  const clientes = useSignal<ClienteResumen[]>([]);
  const filtro = useSignal<FiltroMartillo>("todos");
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
