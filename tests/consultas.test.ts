import { beforeEach, describe, expect, test } from "bun:test";
import { consultaRecordada, olvidarConsultas } from "../src/store";

/** A reader that counts how many times it really reads. */
const lector = (valor: unknown = "dato") => {
  const l = {
    veces: 0,
    leer: async () => {
      l.veces++;
      return valor;
    },
  };
  return l;
};

describe("caché de consultas", () => {
  beforeEach(() => olvidarConsultas(""));

  test("dos llamadas leen una sola vez", async () => {
    const l = lector();
    expect(await consultaRecordada("a", l.leer)).toBe("dato");
    expect(await consultaRecordada("a", l.leer)).toBe("dato");
    expect(l.veces).toBe(1);
  });

  test("llamadas simultáneas comparten la misma lectura", async () => {
    const l = lector();
    await Promise.all([1, 2, 3].map(() => consultaRecordada("a", l.leer)));
    expect(l.veces).toBe(1);
  });

  test("olvidar por prefijo vuelve a leer solo eso", async () => {
    const lotes = lector();
    const clientes = lector();
    await consultaRecordada("remate-1-lotes", lotes.leer);
    await consultaRecordada("clientes", clientes.leer);
    olvidarConsultas("remate-1");
    await consultaRecordada("remate-1-lotes", lotes.leer);
    await consultaRecordada("clientes", clientes.leer);
    expect(lotes.veces).toBe(2);
    expect(clientes.veces).toBe(1);
  });

  test('"" olvida todo', async () => {
    const l = lector();
    await consultaRecordada("a", l.leer);
    await consultaRecordada("b", l.leer);
    olvidarConsultas("");
    await consultaRecordada("a", l.leer);
    await consultaRecordada("b", l.leer);
    expect(l.veces).toBe(4);
  });

  test("un error no queda guardado", async () => {
    let veces = 0;
    const falla = async () => {
      veces++;
      if (veces === 1) throw new Error("sin base");
      return "dato";
    };
    expect(consultaRecordada("a", falla)).rejects.toThrow("sin base");
    await Bun.sleep(0);
    expect(await consultaRecordada("a", falla)).toBe("dato");
    expect(veces).toBe(2);
  });

  test("una lectura que estaba en curso cuando se olvidó no queda guardada", async () => {
    let soltar = () => {};
    let veces = 0;
    const lenta = () =>
      new Promise<string>((ok) => {
        veces++;
        const valor = veces === 1 ? "viejo" : "nuevo";
        if (veces === 1) soltar = () => ok(valor);
        else ok(valor);
      });
    const vieja = consultaRecordada("a", lenta);
    // A write happens while it reads.
    olvidarConsultas("a");
    soltar();
    expect(await vieja).toBe("viejo");
    expect(await consultaRecordada("a", lenta)).toBe("nuevo");
  });
});
