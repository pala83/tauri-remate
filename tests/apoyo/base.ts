/**
 * The app's `src/db` runs here unchanged, on an in-memory SQLite:
 * - `@tauri-apps/plugin-sql` is replaced by `bun:sqlite`, with the same
 *   object rows the plugin returns, so the Drizzle proxy of `src/db/client.ts`
 *   is the real one;
 * - the Rust commands run the SQL of `src-tauri/src/comandos.rs` (see `tauri.ts`).
 */
import { Database } from "bun:sqlite";
import { mock } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { comandos } from "./tauri";

export const raiz = join(import.meta.dir, "../..");

export const sqlite = new Database(":memory:");
sqlite.exec("PRAGMA foreign_keys = ON");

/** Every statement that reaches the database, including the Rust commands'. */
export const contador = { consultas: 0 };

type Parametros = (string | number | bigint | boolean | null)[];

const plugin = {
  async execute(sql: string, params: Parametros = []) {
    contador.consultas++;
    sqlite.query(sql).run(...params);
    return { rowsAffected: 0 };
  },
  async select(sql: string, params: Parametros = []) {
    contador.consultas++;
    return sqlite.query(sql).all(...params);
  },
};

mock.module("@tauri-apps/plugin-sql", () => ({
  default: { load: async () => plugin },
}));
// Applied below, from the same files: the app's version needs Vite.
mock.module(join(raiz, "src/db/migrate.ts"), () => ({
  runMigrations: async () => {},
}));
mock.module("@tauri-apps/api/core", () => ({
  invoke: async (comando: string, args: Record<string, unknown>) => {
    contador.consultas++;
    const correr = comandos[comando];
    if (!correr) throw new Error(`Comando sin simular: ${comando}`);
    return correr(sqlite, args);
  },
  convertFileSrc: (ruta: string) => ruta,
}));

const carpeta = join(raiz, "drizzle");
for (const archivo of readdirSync(carpeta)
  .filter((a) => a.endsWith(".sql"))
  .sort())
  for (const sentencia of readFileSync(join(carpeta, archivo), "utf8")
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean))
    sqlite.exec(sentencia);

const TABLAS = [
  "pago_lotes",
  "pagos",
  "cuotas",
  "liquidaciones",
  "lotes",
  "clientes",
  "remates",
];

/** An empty database, for each test to start from. */
export const vaciarBase = () => {
  // Lots point at each other through `vendido_con`.
  sqlite.exec("PRAGMA foreign_keys = OFF");
  // A sold lot can't be deleted (`lotes_vendidos_no_se_borran`).
  sqlite.exec(
    "UPDATE lotes SET comprador_id = NULL, precio_venta = NULL, vendido_con = NULL",
  );
  for (const tabla of TABLAS) sqlite.exec(`DELETE FROM ${tabla}`);
  sqlite.exec("PRAGMA foreign_keys = ON");
};
