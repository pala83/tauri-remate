import {
  $,
  useComputed$,
  useSignal,
  type QRL,
  type Signal,
} from "@builder.io/qwik";
import type { Mensaje } from "~/components/page-columns/form-message";
import type { ClienteResumen } from "~/db/clientes";
import type { RemateDeCliente } from "~/db/liquidaciones";
import { avisosDe } from "~/lib/liquidacion-avisos";
import { liquidar, type DatosRemate } from "~/lib/liquidacion";
import { errorTxt } from "~/lib/textos";
import { cuotasDe } from "~/components/pagos/cuotas-de";
import { useLiquidacionCarga } from "./use-liquidacion-carga";
import { leerVigente, type Vigente } from "./vigente";

/** The chosen client's settlement, in one of their remates. */
export const useLiquidacion = (
  cliente: Signal<ClienteResumen | undefined>,
  alCambiar$: QRL<() => void>,
) => {
  const remates = useSignal<RemateDeCliente[]>([]);
  const remateId = useSignal<number | null>(null);
  const datos = useSignal<DatosRemate>();
  const mensaje = useSignal<Mensaje>();
  /** What's printed: read again from the database for each print. */
  const impresa = useSignal<Vigente | null>(null);
  // A computed only notifies when the id changes, not on every client reload.
  const clienteId = useComputed$(() => cliente.value?.id);

  const liq = useComputed$(() =>
    datos.value && cliente.value ? liquidar(datos.value, cliente.value) : null,
  );
  const avisos = useComputed$(() =>
    datos.value && cliente.value && liq.value
      ? avisosDe(datos.value, liq.value, cliente.value.id)
      : [],
  );
  /** Computed once here: the plan, the payment form, the list and the print all use them. */
  const cuotas = useComputed$(() =>
    cuotasDe(liq.value, datos.value?.cuotas ?? []),
  );
  const remate = useComputed$(() =>
    remates.value.find((r) => r.id === remateId.value),
  );

  const { leer, elegirRemate } = useLiquidacionCarga({
    clienteId,
    remates,
    remateId,
    datos,
    mensaje,
  });

  /** Its error goes to the caller; once saved it doesn't throw, or a form would be sent twice. */
  const hacer = $(async (accion: QRL<() => Promise<unknown>>) => {
    await accion();
    try {
      await leer();
      await alCambiar$();
    } catch (err) {
      mensaje.value = {
        tipo: "error",
        texto: `Se guardó, pero no se pudo actualizar: ${errorTxt(err)}`,
      };
    }
  });

  /** The same settlement, read again from the database: see `leerVigente`. */
  const vigente = $(() => {
    const id = clienteId.value;
    const remate = remateId.value;
    return id === undefined || remate === null
      ? Promise.resolve(null)
      : leerVigente(id, remate);
  });

  return {
    vigente,
    impresa,
    remates,
    remateId,
    remate,
    datos,
    liq,
    avisos,
    cuotas,
    mensaje,
    hacer,
    elegirRemate,
  };
};

export type LiquidacionState = ReturnType<typeof useLiquidacion>;
