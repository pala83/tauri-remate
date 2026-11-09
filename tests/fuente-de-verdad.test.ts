/**
 * Rule: the store is only a quick way to show data. It's never a source of
 * truth: nothing from it fills a form, feeds a saved calculation or reaches
 * the database. Checked on the code itself:
 * - only the screens' loading hooks read the store (`ver*` of `src/db`);
 * - a file that writes to the database never reads from the store;
 * - `src/db` takes from `~/store` only the cache itself, never a value.
 */
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { raiz } from "./apoyo/base";

/** The hooks that load what a screen shows. Nothing else reads the store. */
const VISTAS = [
  "src/components/clientes-page/use-clientes-page.ts",
  "src/components/clientes-page/use-saldos.ts",
  "src/components/liquidacion/use-liquidacion-carga.ts",
  "src/components/lotes-page/use-lotes-acciones.ts",
  "src/components/martillo/use-martillo-carga.ts",
];

/** Every function of `src/db` that writes. */
const ESCRITURAS = [
  "crearCliente",
  "editarCliente",
  "marcarSinComision",
  "crearLote",
  "editarLote",
  "borrarLote",
  "escribirVentas",
  "generarLiquidacion",
  "editarLiquidacion",
  "guardarCuotas",
  "registrarPago",
  "anularPago",
  "crearRemate",
  "editarRemate",
];

const archivos = (carpeta: string): string[] =>
  readdirSync(join(raiz, carpeta), { withFileTypes: true }).flatMap((d) =>
    d.isDirectory()
      ? archivos(join(carpeta, d.name))
      : /\.tsx?$/.test(d.name)
        ? [join(carpeta, d.name)]
        : [],
  );

/** What each file imports, by module. */
const importes = (archivo: string) =>
  [
    ...readFileSync(join(raiz, archivo), "utf8").matchAll(
      /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*"([^"]+)"/g,
    ),
  ].map(([, nombres, desde]) => ({
    desde,
    nombres: nombres
      .split(",")
      .map((n) =>
        n
          .replace(/^\s*type\s+/, "")
          .split(" as ")[0]
          .trim(),
      )
      .filter(Boolean),
  }));

const TODOS = archivos("src").map((a) => relative(raiz, join(raiz, a)));
const delDb = (desde: string) => desde.startsWith("~/db/");
const leeStore = (a: string) =>
  importes(a).some(
    (i) => delDb(i.desde) && i.nombres.some((n) => /^ver[A-Z]/.test(n)),
  );
const escribe = (a: string) =>
  importes(a).some(
    (i) => delDb(i.desde) && i.nombres.some((n) => ESCRITURAS.includes(n)),
  );

describe("el store nunca es fuente de verdad", () => {
  test("los ver* existen en src/db", () => {
    const exportados = TODOS.filter((a) => a.startsWith("src/db/")).flatMap(
      (a) =>
        [
          ...readFileSync(join(raiz, a), "utf8").matchAll(
            /export const (ver[A-Z]\w*)/g,
          ),
        ].map((m) => m[1]),
    );
    expect(exportados.sort()).toEqual([
      "verClientes",
      "verDatosRemate",
      "verHistorial",
      "verLotes",
      "verRematesDeCliente",
    ]);
  });

  test("solo los hooks de vista leen del store", () => {
    const leen = TODOS.filter((a) => !a.startsWith("src/db/") && leeStore(a));
    expect(leen.filter((a) => !VISTAS.includes(a))).toEqual([]);
  });

  test("ningún archivo que escribe en la base lee del store", () => {
    expect(TODOS.filter((a) => escribe(a) && leeStore(a))).toEqual([]);
  });

  test("src/db solo toma de ~/store la caché, nunca un valor", () => {
    const usos = TODOS.filter((a) => a.startsWith("src/db/")).flatMap((a) =>
      importes(a)
        .filter((i) => i.desde === "~/store" || i.desde.startsWith("~/store/"))
        .flatMap((i) => i.nombres),
    );
    expect(
      usos.filter(
        (n) => !["consultaRecordada", "olvidarConsultas"].includes(n),
      ),
    ).toEqual([]);
    expect(usos).toContain("consultaRecordada");
    expect(usos).toContain("olvidarConsultas");
  });

  test("la caché solo se usa desde src/db", () => {
    const usan = TODOS.filter(
      (a) =>
        !a.startsWith("src/db/") &&
        !a.startsWith("src/store/") &&
        importes(a).some((i) =>
          i.nombres.some((n) =>
            ["consultaRecordada", "olvidarConsultas"].includes(n),
          ),
        ),
    );
    expect(usan).toEqual([]);
  });
});
