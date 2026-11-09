/**
 * A client's name is unique. Renaming one to another's name unifies them: every
 * foreign key of the renamed client moves to the other one, and it's deleted.
 */
import { describe, expect, test } from "bun:test";
import {
  clienteLlamado,
  crearCliente,
  editarCliente,
  leerCliente,
  listarClientes,
  unificarClientes,
} from "../src/db/clientes";
import {
  editarLiquidacion,
  generarLiquidacion,
  leerDatosRemate,
} from "../src/db/liquidaciones";
import { listarLotes } from "../src/db/lotes";
import { liquidar } from "../src/lib/liquidacion";
import { sqlite } from "./apoyo/base";
import { sembrar } from "./apoyo/escenario";

const cuenta = (sql: string, ...params: number[]) =>
  (sqlite.query(sql).get(...params) as { n: number }).n;

describe("nombre único", () => {
  test("crearCliente con un nombre que ya existe falla", async () => {
    await sembrar();
    expect(crearCliente({ nombre: "  ana   PÉREZ " })).rejects.toThrow(
      "Ya existe un cliente llamado Ana Pérez.",
    );
    expect(await listarClientes()).toHaveLength(3);
  });

  test("editarCliente con el nombre de otro falla: unificar es aparte", async () => {
    const e = await sembrar();
    expect(editarCliente(e.beto, { nombre: "Ana Pérez" })).rejects.toThrow(
      "Ya existe un cliente llamado Ana Pérez.",
    );
    expect((await leerCliente(e.beto)).nombre).toBe("beto gómez");
  });

  test("clienteLlamado encuentra al otro, nunca a sí mismo", async () => {
    const e = await sembrar();
    expect((await clienteLlamado(" ANA  pérez"))?.id).toBe(e.ana);
    expect(await clienteLlamado("Ana Pérez", e.ana)).toBeUndefined();
    expect((await clienteLlamado("Ana Pérez", e.beto))?.id).toBe(e.ana);
    expect(await clienteLlamado("Nadie")).toBeUndefined();
  });
});

describe("unificarClientes", () => {
  test("lotes y liquidaciones pasan al que queda, y el otro se elimina", async () => {
    const e = await sembrar();
    const antes = await leerCliente(e.beto);
    // Caro owns the trunk in the other remate and has a settlement in this one.
    await unificarClientes(e.beto, e.caro);

    expect(leerCliente(e.caro)).rejects.toThrow("No se encontró el cliente.");
    const queda = await leerCliente(e.beto);
    expect({ ...queda, aporta: 0, compro: 0 }).toEqual({
      ...antes,
      aporta: 0,
      compro: 0,
    });
    expect(queda.aporta).toBe(3);
    expect(queda.compro).toBe(2);
    const lotes = await listarLotes(e.remate);
    expect(
      lotes.filter((l) => l.compradorId === e.beto).map((l) => l.numero),
    ).toEqual([1, 2]);
    const datos = await leerDatosRemate(e.remate);
    expect(datos.liquidaciones.map((q) => q.clienteId)).toEqual([e.beto]);
    expect(datos.liquidaciones[0].id).toBe(e.liqCaro);
    for (const tabla of ["lotes", "liquidaciones"])
      expect(
        cuenta(
          `select count(*) n from ${tabla} where ${tabla === "lotes" ? "dueno_id = ? or comprador_id = ?" : "cliente_id = ? or cliente_id = ?"}`,
          e.caro,
          e.caro,
        ),
      ).toBe(0);
  });

  test("dos liquidaciones en el mismo remate se juntan en la del que queda", async () => {
    const e = await sembrar();
    await generarLiquidacion(e.remate, e.ana, false);
    const previo = await leerDatosRemate(e.remate);
    const liqAna = previo.liquidaciones.find((q) => q.clienteId === e.ana)!;
    await editarLiquidacion(liqAna.id, { notas: "de ana" });
    await editarLiquidacion(e.liqCaro, { notas: "de caro" });
    const datosAntes = await leerDatosRemate(e.remate);
    const ana = liquidar(datosAntes, await leerCliente(e.ana));
    const caro = liquidar(datosAntes, await leerCliente(e.caro));
    const cuotas = cuenta("select count(*) n from cuotas");
    const pagos = cuenta("select count(*) n from pagos");

    await unificarClientes(e.ana, e.caro);

    const datos = await leerDatosRemate(e.remate);
    expect(datos.liquidaciones).toHaveLength(1);
    const [liq] = datos.liquidaciones;
    expect(liq).toMatchObject({ id: liqAna.id, clienteId: e.ana });
    expect(liq.notas).toBe("de ana\nde caro");
    expect(cuenta("select count(*) n from cuotas")).toBe(cuotas);
    expect(cuenta("select count(*) n from pagos")).toBe(pagos);
    expect(datos.cuotas.every((c) => c.liquidacionId === liqAna.id)).toBe(true);
    expect(datos.pagos.every((p) => p.liquidacionId === liqAna.id)).toBe(true);
    const junto = liquidar(datos, await leerCliente(e.ana));
    expect(junto.tCompras).toBe(ana.tCompras + caro.tCompras);
    expect(junto.tVentas).toBe(ana.tVentas + caro.tVentas);
    expect(junto.cobros).toBe(ana.cobros + caro.cobros);
    expect(junto.saldo).toBe(ana.saldo + caro.saldo);
  });

  test("con sí mismo falla y no borra nada", async () => {
    const e = await sembrar();
    expect(unificarClientes(e.ana, e.ana)).rejects.toThrow();
    expect((await leerCliente(e.ana)).aporta).toBe(3);
  });

  test("con un cliente que no existe falla y no cambia nada", async () => {
    const e = await sembrar();
    expect(unificarClientes(9999, e.caro)).rejects.toThrow(
      "No se encontró el cliente.",
    );
    expect((await leerCliente(e.caro)).compro).toBe(2);
  });
});
