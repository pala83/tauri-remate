import { expect, test } from "bun:test";
import { contador } from "./apoyo/base";
import { sembrar, verdad, vistas } from "./apoyo/escenario";

test("volver a una pestaña sin haber escrito nada no consulta la base", async () => {
  const e = await sembrar();
  await vistas(e);
  contador.consultas = 0;
  await vistas(e);
  expect(contador.consultas).toBe(0);
});

test("las lecturas de verdad siempre van a la base", async () => {
  const e = await sembrar();
  await vistas(e);
  contador.consultas = 0;
  await verdad(e);
  expect(contador.consultas).toBeGreaterThan(0);
});

test("lo que llena formularios o se guarda nunca sale del store", async () => {
  const { leerCliente } = await import("../src/db/clientes");
  const { leerLiquidacion } = await import("../src/db/liquidaciones");
  const { leerLote, lotesDeVenta, ultimoLote } = await import(
    "../src/db/lotes"
  );
  const { leerRemate } = await import("../src/db/remates");
  const { leerVigente } = await import("../src/components/liquidacion/vigente");
  const e = await sembrar();
  await vistas(e);
  const lecturas = [
    () => leerCliente(e.caro),
    () => leerLiquidacion(e.liqCaro),
    () => leerLote(e.remate, 1),
    () => lotesDeVenta(e.remate, [1]),
    () => ultimoLote(e.remate),
    () => leerRemate(e.remate),
    () => leerVigente(e.caro, e.remate),
  ];
  for (const leer of lecturas) {
    for (const vez of [1, 2]) {
      contador.consultas = 0;
      await leer();
      expect(contador.consultas, `${leer} (vez ${vez})`).toBeGreaterThan(0);
    }
  }
});
