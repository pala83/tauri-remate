import { cuotasDe } from "~/components/pagos/cuotas-de";
import { leerCliente } from "~/db/clientes";
import { leerDatosRemate } from "~/db/liquidaciones";
import { leerRemate } from "~/db/remates";
import { liquidar } from "~/lib/liquidacion";

/**
 * A client's settlement as the database has it right now, read for anything
 * that fills a form, gets saved or printed. The one on screen comes from the
 * store and is only for showing.
 */
export const leerVigente = async (clienteId: number, remateId: number) => {
  const [datos, cliente, remate] = await Promise.all([
    leerDatosRemate(remateId),
    leerCliente(clienteId),
    leerRemate(remateId),
  ]);
  const liq = liquidar(datos, cliente);
  return { cliente, remate, liq, cuotas: cuotasDe(liq, datos.cuotas) };
};

export type Vigente = Awaited<ReturnType<typeof leerVigente>>;
