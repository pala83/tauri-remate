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

type ClienteLiquidado = Pick<Cliente, "id" | "sinComision">;

export const liquidar = (datos: DatosRemate, cliente: ClienteLiquidado) => {
  const { lotes } = datos;
  const liq =
    datos.liquidaciones.find((q) => q.clienteId === cliente.id) ?? null;
  const sinComision = liq ? liq.sinComision : cliente.sinComision;
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
