import { $, useComputed$, useSignal, type Signal } from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import type { ClienteResumen } from "~/db/clientes";
import { leerDatosRemate } from "~/db/liquidaciones";
import { liquidar, type DatosRemate } from "~/lib/liquidacion";

/** Every client's balance in the active remate, for the list and its totals. */
export const useSaldos = (clientes: Signal<ClienteResumen[]>) => {
  const { state } = useAppState();
  const datos = useSignal<DatosRemate>();

  const saldos = useComputed$(() => {
    const leidos = datos.value;
    if (!leidos) return {};
    return Object.fromEntries(
      clientes.value.map((c) => [c.id, liquidar(leidos, c)]),
    );
  });
  const deuda = useComputed$(() => {
    const lista = Object.values(saldos.value);
    const deudores = lista.filter((x) => x.saldo > 0);
    const acreedores = lista.filter((x) => x.saldo < 0);
    return {
      deben: deudores.reduce((suma, x) => suma + x.saldo, 0),
      nDeben: deudores.length,
      aPagar: -acreedores.reduce((suma, x) => suma + x.saldo, 0),
      nAPagar: acreedores.length,
      cobrado: lista.reduce((suma, x) => suma + x.cobros, 0),
      pagado: lista.reduce((suma, x) => suma + x.pagosAl, 0),
    };
  });

  const leerSaldos = $(async () => {
    const id = state.activoId;
    datos.value = id === null ? undefined : await leerDatosRemate(id);
  });

  return { saldos, deuda, leerSaldos };
};
