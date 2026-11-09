/** A remate with sales, a set, a settlement, installments and a payment. */
import {
  listarClientes,
  crearCliente,
  historialCliente,
} from "../../src/db/clientes";
import { verClientes, verHistorial } from "../../src/db/clientes";
import { leerDatosRemate, rematesDeCliente } from "../../src/db/liquidaciones";
import {
  verDatosRemate,
  verRematesDeCliente,
} from "../../src/db/liquidaciones";
import { generarLiquidacion } from "../../src/db/liquidaciones";
import { crearLote, listarLotes, verLotes } from "../../src/db/lotes";
import { guardarCuotas, registrarPago } from "../../src/db/pagos";
import { crearRemate } from "../../src/db/remates";
import { escribirVentas } from "../../src/db/ventas";
import { liquidar } from "../../src/lib/liquidacion";
import { olvidarConsultas } from "../../src/store";
import { vaciarBase } from "./base";

export type Escenario = Awaited<ReturnType<typeof sembrar>>;

const venta = (
  numero: number,
  compradorId: number,
  precioVenta: number | null,
  vendidoCon: number | null = null,
) => ({
  numero,
  compradorId,
  precioVenta,
  vendidoCon,
  comisionCompra: 1000,
  comisionVenta: 1000,
});

export const sembrar = async () => {
  vaciarBase();
  olvidarConsultas("");
  const remate = await crearRemate({
    nombre: "remate de prueba",
    fecha: new Date("2026-03-01T12:00:00Z"),
    lugar: null,
  });
  const otro = await crearRemate({
    nombre: "otro remate",
    fecha: new Date("2026-04-01T12:00:00Z"),
    lugar: null,
  });
  const ana = await crearCliente({ nombre: "Ana Pérez" });
  const beto = await crearCliente({ nombre: "Beto Gómez" });
  const caro = await crearCliente({ nombre: "Caro Díaz", sinComision: false });
  for (const [nombre, duenoId] of [
    ["mesa", ana],
    ["silla", ana],
    ["lámpara", beto],
    ["cuadro", beto],
    ["reloj", ana],
  ] as const)
    await crearLote(remate, { nombre, duenoId });
  await crearLote(otro, { nombre: "baúl", duenoId: caro });
  // N° 1 and 2 to Caro for one price, N° 3 to Ana.
  await escribirVentas(remate, [
    venta(1, caro, 10000),
    venta(2, caro, null, 1),
    venta(3, ana, 2350),
  ]);
  await generarLiquidacion(remate, caro, false);
  const datos = await leerDatosRemate(remate);
  const liqCaro = datos.liquidaciones.find((q) => q.clienteId === caro)!;
  await guardarCuotas([
    {
      liquidacionId: liqCaro.id,
      remateId: null,
      loteNumero: null,
      plazoDias: 0,
      vence: new Date("2026-03-01T12:00:00Z"),
      monto: 5500,
    },
    {
      liquidacionId: liqCaro.id,
      remateId: null,
      loteNumero: null,
      plazoDias: 30,
      vence: new Date("2026-03-31T12:00:00Z"),
      monto: 5500,
    },
  ]);
  await registrarPago(
    {
      liquidacionId: liqCaro.id,
      cuotaId: null,
      sentido: "cobro",
      fecha: new Date("2026-03-02T12:00:00Z"),
      monto: 11000,
      medio: "efectivo",
      referencia: null,
      acredita: null,
    },
    [{ remateId: remate, loteNumero: 1, monto: 11000 }],
  );
  return { remate, otro, ana, beto, caro, liqCaro: liqCaro.id };
};

/** Every view the screens show, from the store. */
export const vistas = async (e: Escenario) => {
  const clientes = await verClientes();
  const ids = clientes.map((c) => c.id);
  return {
    clientes,
    lotes: await verLotes(e.remate),
    datos: await verDatosRemate(e.remate),
    otros: await verDatosRemate(e.otro),
    historial: await Promise.all(ids.map((id) => verHistorial(id))),
    remates: await Promise.all(ids.map((id) => verRematesDeCliente(id))),
  };
};

/** The same, read from the database itself. */
export const verdad = async (e: Escenario) => {
  const clientes = await listarClientes();
  const ids = clientes.map((c) => c.id);
  return {
    clientes,
    lotes: await listarLotes(e.remate),
    datos: await leerDatosRemate(e.remate),
    otros: await leerDatosRemate(e.otro),
    historial: await Promise.all(ids.map((id) => historialCliente(id))),
    remates: await Promise.all(ids.map((id) => rematesDeCliente(id))),
  };
};

/** What each client's settlement says, worked out from those views. */
export const saldos = (v: Awaited<ReturnType<typeof vistas>>) =>
  v.clientes.map((c) => liquidar(v.datos, c));
