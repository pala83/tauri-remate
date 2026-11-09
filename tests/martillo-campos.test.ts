/** The hammer works out a sale from lots just read from the database. */
import { expect, test } from "bun:test";
import type { LoteConClientes } from "../src/db/lotes";
import { camposDe, ventaAdjudicada } from "../src/lib/martillo-campos";

const lote = (numero: number, cambios: Partial<LoteConClientes> = {}) =>
  ({
    remateId: 1,
    numero,
    duenoId: 1,
    compradorId: null,
    precioVenta: null,
    vendidoCon: null,
    comisionCompra: 1000,
    comisionVenta: 1000,
    ...cambios,
  }) as LoteConClientes;

const venta = {
  precio: 5000,
  compradorId: 7,
  comisionCompra: 1000,
  comisionVenta: 500,
};

test("los campos de un lote vendido son los suyos", () => {
  const lotes = [
    lote(1, { compradorId: 3, precioVenta: 2000, comisionCompra: 800 }),
    lote(2, { compradorId: 3, vendidoCon: 1 }),
  ];
  expect(camposDe(lotes, 1)).toEqual({
    precio: "2000",
    compradorId: 3,
    comisionCompra: "8",
    comisionVenta: "10",
    grupo: [2],
  });
});

test("un lote sin vender empieza de la comisión por defecto", () => {
  expect(camposDe([lote(1, { comisionCompra: 300 })], 1).comisionCompra).toBe(
    "10",
  );
});

test("cambiar el comprador suelta los pagos del lote", () => {
  const r = ventaAdjudicada(
    [lote(1, { compradorId: 3, precioVenta: 10 })],
    1,
    venta,
    [],
  );
  expect(typeof r !== "string" && r.soltar).toEqual([1]);
});

test("no vende un lote que ya se vendió con otro", () => {
  expect(
    ventaAdjudicada([lote(2, { compradorId: 3, vendidoCon: 1 })], 2, venta, []),
  ).toContain("se vendió junto con el N° 1");
});

test("no suma al conjunto un lote vendido aparte", () => {
  const lotes = [lote(1), lote(2, { compradorId: 3, precioVenta: 10 })];
  expect(ventaAdjudicada(lotes, 1, venta, [2])).toContain(
    "N° 2 ya no se puede",
  );
});

test("no suma al conjunto un lote que ya no existe", () => {
  expect(ventaAdjudicada([lote(1)], 1, venta, [9])).toContain("N° 9");
});
