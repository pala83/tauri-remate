import type { LoteConClientes } from "~/db/lotes";
import type { Cliente, Cuota, Liquidacion, Pago, PagoLote } from "~/db/schema";
import {
  lineaCompra,
  lineaVenta,
  type LineaLiquidacion,
} from "./liquidacion-lineas";

/** All a remate needs to settle its clients; amounts are never stored. */
export type DatosRemate = {
  lotes: LoteConClientes[];
  liquidaciones: Liquidacion[];
  cuotas: Cuota[];
  pagos: Pago[];
  pagoLotes: PagoLote[];
};

/** What payments that weren't annulled cover, lot by lot. */
export const pagoLotesVigentes = (datos: DatosRemate) => {
  const anulados = new Set(datos.pagos.filter((p) => p.anulado).map((p) => p.id));
  return datos.pagoLotes.filter((pl) => !anulados.has(pl.pagoId));
};

/**
 * Whether a client pays no commission in this remate: their settlement says,
 * and before there is one, the client's own setting (copied to it on creation).
 */
export const sinComisionDe = (
  datos: DatosRemate,
  clienteId: number,
  delCliente: boolean,
) => {
  const liq = datos.liquidaciones.find((q) => q.clienteId === clienteId);
  return liq ? liq.sinComision : delCliente;
};

type ClienteLiquidado = Pick<Cliente, "id" | "sinComision">;

export const liquidar = (datos: DatosRemate, cliente: ClienteLiquidado) => {
  const { lotes } = datos;
  const liq =
    datos.liquidaciones.find((q) => q.clienteId === cliente.id) ?? null;
  const sinComision = sinComisionDe(datos, cliente.id, cliente.sinComision);
  const pagos = liq ? datos.pagos.filter((p) => p.liquidacionId === liq.id) : [];
  const validos = pagos.filter((p) => !p.anulado);
  const idsValidos = new Set(validos.map((p) => p.id));

  const pagadoDe = (numero: number) =>
    datos.pagoLotes
      .filter((pl) => pl.loteNumero === numero && idsValidos.has(pl.pagoId))
      .reduce((suma, pl) => suma + pl.monto, 0);

  const compras: LineaLiquidacion[] = [];
  const ventas: LineaLiquidacion[] = [];
  for (const l of lotes) {
    if (l.precioVenta === null) continue;
    if (l.compradorId === cliente.id) {
      const comision = sinComision ? 0 : l.comisionCompra;
      compras.push(lineaCompra(l, lotes, comision, pagadoDe(l.numero), cliente.id));
    }
    if (l.duenoId === cliente.id) {
      const comision = sinComision ? 0 : l.comisionVenta;
      ventas.push(lineaVenta(l, lotes, comision, cliente.id));
    }
  }

  const suma = (lineas: LineaLiquidacion[]) =>
    lineas.reduce((total, linea) => total + linea.total, 0);
  const sumaPagos = (sentido: Pago["sentido"]) =>
    validos
      .filter((p) => p.sentido === sentido)
      .reduce((total, p) => total + p.monto, 0);

  const tCompras = suma(compras);
  const tVentas = suma(ventas);
  const cobros = sumaPagos("cobro");
  const pagosAl = sumaPagos("pago");
  const neto = tCompras - tVentas;

  return {
    liq,
    sinComision,
    compras,
    ventas,
    pagos,
    nPagos: validos.length,
    tCompras,
    tVentas,
    neto,
    cobros,
    pagosAl,
    saldo: neto - cobros + pagosAl,
    hayMovimientos: compras.length + ventas.length + pagos.length > 0,
  };
};

export type Liquidado = ReturnType<typeof liquidar>;

export const lotesSinVender = (datos: DatosRemate, id: number) =>
  datos.lotes.filter((l) => l.duenoId === id && l.compradorId === null).length;
