/**
 * A remate is deleted only with no lots and no clients (settlements); every key
 * pointing at it is `restrict`. A lot is deleted only while its sale isn't
 * registered, and the database itself refuses otherwise.
 */
import { describe, expect, test } from "bun:test";
import { borrarLote, leerLote, listarLotes } from "../src/db/lotes";
import { borrarRemate, crearRemate, leerRemate } from "../src/db/remates";
import { sqlite } from "./apoyo/base";
import { sembrar } from "./apoyo/escenario";

const remateVacio = () =>
  crearRemate({
    nombre: "remate vacío",
    fecha: new Date("2026-06-01T12:00:00Z"),
    lugar: null,
  });

describe("borrarRemate", () => {
  test("uno vacío se elimina", async () => {
    await sembrar();
    const id = await remateVacio();
    await borrarRemate(id);
    expect(leerRemate(id)).rejects.toThrow("No se encontró el remate.");
  });

  test("con lotes no se elimina", async () => {
    const e = await sembrar();
    expect(borrarRemate(e.remate)).rejects.toThrow(
      "No se puede eliminar: tiene 5 lotes.",
    );
    expect(borrarRemate(e.otro)).rejects.toThrow(
      "No se puede eliminar: tiene 1 lote.",
    );
    expect((await leerRemate(e.remate)).id).toBe(e.remate);
  });

  test("con una liquidación y sin lotes no se elimina", async () => {
    const e = await sembrar();
    const id = await remateVacio();
    sqlite
      .query("INSERT INTO liquidaciones (remate_id, cliente_id) VALUES (?, ?)")
      .run(id, e.ana);
    expect(borrarRemate(id)).rejects.toThrow(
      "No se puede eliminar: tiene la liquidación de 1 cliente.",
    );
    expect((await leerRemate(id)).id).toBe(id);
  });

  test("la base lo impide sola: las claves son restrict", async () => {
    const e = await sembrar();
    expect(() =>
      sqlite.query("DELETE FROM remates WHERE id = ?").run(e.remate),
    ).toThrow("FOREIGN KEY constraint failed");
  });
});

describe("borrarLote", () => {
  test("uno sin vender se elimina", async () => {
    const e = await sembrar();
    await borrarLote(e.remate, 5);
    expect((await listarLotes(e.remate)).map((l) => l.numero)).toEqual([
      1, 2, 3, 4,
    ]);
  });

  test("uno vendido, solo o junto con otro, no se elimina", async () => {
    const e = await sembrar();
    for (const n of [3, 2, 1]) {
      expect(borrarLote(e.remate, n)).rejects.toThrow(
        `No se puede eliminar el N° ${n}: tiene la compra registrada.`,
      );
      expect((await leerLote(e.remate, n)).numero).toBe(n);
    }
  });

  test("la base lo impide sola", async () => {
    const e = await sembrar();
    expect(() =>
      sqlite
        .query("DELETE FROM lotes WHERE remate_id = ? AND numero = 3")
        .run(e.remate),
    ).toThrow("lote vendido");
  });
});
