import {
  $,
  useComputed$,
  useSignal,
  useVisibleTask$,
  type QRL,
  type Signal,
} from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import type { Mensaje } from "~/components/page-columns/form-message";
import type { ClienteResumen } from "~/db/clientes";
import { leerDatosRemate, rematesDeCliente } from "~/db/liquidaciones";
import type { RemateDeCliente } from "~/db/liquidaciones";
import { avisosDe } from "~/lib/liquidacion-avisos";
import { liquidar, type DatosRemate } from "~/lib/liquidacion";
import { errorTxt } from "~/lib/textos";

/** The chosen client's settlement, in one of their remates. */
export const useLiquidacion = (
  cliente: Signal<ClienteResumen | undefined>,
  alCambiar$: QRL<() => void>,
) => {
  const { state } = useAppState();
  const remates = useSignal<RemateDeCliente[]>([]);
  const remateId = useSignal<number | null>(null);
  const datos = useSignal<DatosRemate>();
  const mensaje = useSignal<Mensaje>();

  const liq = useComputed$(() =>
    datos.value && cliente.value ? liquidar(datos.value, cliente.value) : null,
  );
  const avisos = useComputed$(() =>
    datos.value && cliente.value && liq.value
      ? avisosDe(datos.value, liq.value, cliente.value.id)
      : [],
  );
  const remate = useComputed$(() =>
    remates.value.find((r) => r.id === remateId.value),
  );

  const leer = $(async () => {
    datos.value =
      remateId.value === null
        ? undefined
        : await leerDatosRemate(remateId.value);
  });

  const hacer = $(async (accion: QRL<() => Promise<unknown>>) => {
    try {
      await accion();
      await leer();
      await alCambiar$();
    } catch (err) {
      mensaje.value = { tipo: "error", texto: errorTxt(err) };
      throw err;
    }
  });

  const elegirRemate = $(async (id: number) => {
    remateId.value = id;
    mensaje.value = undefined;
    await leer();
  });

  // The database only exists in the webview, so this loads on the client.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    const id = track(() => cliente.value?.id);
    const activo = track(() => state.activoId);
    mensaje.value = undefined;
    if (id === undefined) return;
    try {
      remates.value = await rematesDeCliente(id);
      const lista = remates.value;
      remateId.value = lista.some((r) => r.id === activo)
        ? activo
        : (lista[0]?.id ?? null);
      await leer();
    } catch (err) {
      mensaje.value = { tipo: "error", texto: errorTxt(err) };
    }
  });

  return {
    remates,
    remateId,
    remate,
    datos,
    liq,
    avisos,
    mensaje,
    leer,
    hacer,
    elegirRemate,
  };
};

export type LiquidacionState = ReturnType<typeof useLiquidacion>;
