import { $, type QRL } from "@builder.io/qwik";
import { leerCliente, type ClienteResumen } from "~/db/clientes";
import {
  editarLiquidacion,
  generarLiquidacion,
  leerLiquidacion,
} from "~/db/liquidaciones";
import { imprimir } from "~/lib/imprimir";
import { errorTxt } from "~/lib/textos";
import { ID_IMPRESA } from "./liquidacion-impresa";
import type { LiquidacionState } from "./use-liquidacion";

/** Two frames: what was just drawn reaches the DOM. */
const dibujado = () =>
  new Promise((listo) =>
    requestAnimationFrame(() => requestAnimationFrame(listo)),
  );

/** What's saved is read from the database, never taken from the screen. */
export const useLiquidacionAcciones = (
  estado: LiquidacionState,
  cliente: { value: ClienteResumen | undefined },
) => {
  const { liq, mensaje, remateId } = estado;

  /** These show their errors at the foot of the settlement. */
  const hacer = $(async (accion: QRL<() => Promise<unknown>>) => {
    try {
      await estado.hacer(accion);
      return true;
    } catch (err) {
      mensaje.value = { tipo: "error", texto: errorTxt(err) };
      return false;
    }
  });

  const generar = $(async () => {
    const clienteId = cliente.value?.id;
    const id = remateId.value;
    if (clienteId === undefined || id === null) return;
    const hecho = await hacer(
      $(async () => {
        // Copied from the client as the database has it.
        const { sinComision } = await leerCliente(clienteId);
        await generarLiquidacion(id, clienteId, sinComision);
      }),
    );
    if (hecho)
      mensaje.value = {
        tipo: "ok",
        texto: "Liquidación generada: ya se pueden registrar pagos.",
      };
  });

  const cambiarSinComision = $(async () => {
    const id = liq.value?.liq?.id;
    if (id === undefined) return;
    await hacer(
      $(async () => {
        const { sinComision } = await leerLiquidacion(id);
        await editarLiquidacion(id, { sinComision: !sinComision });
      }),
    );
  });

  const guardarNotas = $(async (notas: string) => {
    const id = liq.value?.liq?.id;
    if (id === undefined) return;
    await hacer(
      $(async () => {
        const antes = await leerLiquidacion(id);
        if (notas !== (antes.notas ?? ""))
          await editarLiquidacion(id, { notas: notas || null });
      }),
    );
  });

  const imprimirLiquidacion = $(async () => {
    estado.impresa.value = null;
    try {
      const vigente = await estado.vigente();
      if (!vigente) return;
      estado.impresa.value = vigente;
      await dibujado();
      await imprimir(ID_IMPRESA);
    } catch (err) {
      mensaje.value = { tipo: "error", texto: errorTxt(err) };
    }
  });

  return { generar, cambiarSinComision, guardarNotas, imprimirLiquidacion };
};
