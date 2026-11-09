/**
 * Rule: every change written to the database updates the store the screens
 * read. For each write of `src/db`, the views from the store equal the same
 * reads done on the database, and so do the balances worked out from them.
 */
import { describe, expect, test } from "bun:test";
import {
  crearCliente,
  editarCliente,
  marcarSinComision,
  unificarClientes,
} from "../src/db/clientes";
import {
  editarLiquidacion,
  generarLiquidacion,
  leerDatosRemate,
} from "../src/db/liquidaciones";
import { borrarLote, crearLote, editarLote } from "../src/db/lotes";
import { anularPago, guardarCuotas, registrarPago } from "../src/db/pagos";
import { borrarRemate, crearRemate, editarRemate } from "../src/db/remates";
import { escribirVentas } from "../src/db/ventas";
import {
  saldos,
  sembrar,
  verdad,
  vistas,
  type Escenario,
} from "./apoyo/escenario";

const venta = (
  numero: number,
  compradorId: number | null,
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

const cobro = (liquidacionId: number, monto: number) => ({
  liquidacionId,
  cuotaId: null,
  sentido: "cobro" as const,
  fecha: new Date("2026-03-05T12:00:00Z"),
  monto,
  medio: "efectivo" as const,
  referencia: null,
  acredita: null,
});

/**
 * Fills the store, writes, and compares it with the database. `cambia` checks
 * the case means something: what the screens show did change.
 */
const alDia = async (
  escribir: (e: Escenario) => Promise<unknown>,
  cambia = true,
) => {
  const e = await sembrar();
  const antes = await vistas(e);
  await escribir(e);
  const despues = await vistas(e);
  const base = await verdad(e);
  expect(despues).toEqual(base);
  expect(saldos(despues)).toEqual(saldos(base));
  if (cambia) expect(antes).not.toEqual(base);
};

describe("lotes", () => {
  test("crearLote", () =>
    alDia((e) => crearLote(e.remate, { nombre: "jarrón", duenoId: e.beto })));

  test("editarLote, sin cambiar el comprador", () =>
    alDia((e) =>
      editarLote(e.remate, 4, {
        nombre: "cuadro grande",
        duenoId: e.ana,
        precioBase: 4000,
      }),
    ));

  test("editarLote, con otro comprador (suelta los pagos y arrastra el conjunto)", () =>
    alDia((e) =>
      editarLote(e.remate, 1, {
        nombre: "mesa",
        duenoId: e.ana,
        compradorId: e.beto,
        precioVenta: 10000,
        vendidoCon: null,
      }),
    ));

  test("borrarLote", () => alDia((e) => borrarLote(e.remate, 5)));
});

describe("ventas del martillo", () => {
  test("adjudicar", () =>
    alDia((e) => escribirVentas(e.remate, [venta(4, e.ana, 5000)])));

  test("adjudicar un conjunto", () =>
    alDia((e) =>
      escribirVentas(e.remate, [
        venta(4, e.beto, 3000),
        venta(5, e.beto, null, 4),
      ]),
    ));

  test("quitar la venta, soltando lo pagado", () =>
    alDia((e) =>
      escribirVentas(e.remate, [venta(1, null, null), venta(2, null, null)], {
        soltar: [1],
      }),
    ));

  test("deshacer: devolver la venta y lo pagado", () =>
    alDia(async (e) => {
      const pagos = await escribirVentas(
        e.remate,
        [venta(1, null, null), venta(2, null, null)],
        { soltar: [1] },
      );
      await vistas(e);
      await escribirVentas(
        e.remate,
        [venta(1, e.caro, 10000), venta(2, e.caro, null, 1)],
        { devolver: pagos },
      );
    }, false));
});

describe("clientes", () => {
  test("crearCliente", () => alDia(() => crearCliente({ nombre: "Dani" })));

  test("editarCliente: el nombre nuevo llega a lotes e historial", () =>
    alDia((e) => editarCliente(e.ana, { nombre: "Ana María Pérez" })));

  test("marcarSinComision", () => alDia((e) => marcarSinComision(e.ana, true)));

  test("unificarClientes: los lotes y la liquidación pasan al que queda", () =>
    alDia((e) => unificarClientes(e.beto, e.caro)));

  test("unificarClientes: dos liquidaciones del mismo remate se juntan", () =>
    alDia(async (e) => {
      await generarLiquidacion(e.remate, e.ana, false);
      await unificarClientes(e.ana, e.caro);
    }));
});

describe("liquidaciones y pagos", () => {
  test("generarLiquidacion", () =>
    alDia((e) => generarLiquidacion(e.remate, e.ana, false)));

  test("editarLiquidacion: sin comisión", () =>
    alDia((e) => editarLiquidacion(e.liqCaro, { sinComision: true })));

  test("editarLiquidacion: notas", () =>
    alDia((e) => editarLiquidacion(e.liqCaro, { notas: "paga el lunes" })));

  test("guardarCuotas", () =>
    alDia((e) =>
      guardarCuotas([
        {
          liquidacionId: e.liqCaro,
          remateId: e.remate,
          loteNumero: 1,
          plazoDias: 60,
          vence: new Date("2026-05-01T12:00:00Z"),
          monto: 1000,
        },
      ]),
    ));

  test("registrarPago a cuenta", () =>
    alDia((e) => registrarPago(cobro(e.liqCaro, 500), [])));

  test("registrarPago por lotes", () =>
    alDia(async (e) => {
      await generarLiquidacion(e.remate, e.ana, false);
      await vistas(e);
      const datos = await leerDatosRemate(e.remate);
      const liq = datos.liquidaciones.find((q) => q.clienteId === e.ana)!;
      await registrarPago(cobro(liq.id, 2585), [
        { remateId: e.remate, loteNumero: 3, monto: 2585 },
      ]);
    }));

  test("anularPago", () =>
    alDia(async (e) => {
      const datos = await leerDatosRemate(e.remate);
      await anularPago(datos.pagos[0].id);
    }));
});

describe("remates", () => {
  test("crearRemate", () =>
    alDia(
      () =>
        crearRemate({
          nombre: "remate nuevo",
          fecha: new Date("2026-06-01T12:00:00Z"),
          lugar: null,
        }),
      false,
    ));

  test("editarRemate: el nombre nuevo llega al historial", () =>
    alDia((e) => editarRemate(e.remate, { nombre: "remate renombrado" })));

  test("borrarRemate, de uno vacío", () =>
    alDia(async () => {
      const id = await crearRemate({
        nombre: "remate vacío",
        fecha: new Date("2026-06-01T12:00:00Z"),
        lugar: null,
      });
      await borrarRemate(id);
    }, false));
});
