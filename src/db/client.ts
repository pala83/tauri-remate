import { drizzle, type SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import { runMigrations } from "./migrate";
import * as schema from "./schema";

export type Db = SqliteRemoteDatabase<typeof schema>;

let dbPromise: Promise<Db> | undefined;

/**
 * Lazily opens the SQLite database through tauri-plugin-sql, applies pending
 * migrations and returns a Drizzle instance. Only works inside the Tauri
 * webview: call it from client-side code (`useVisibleTask$`, event handlers),
 * never during SSR/prerender, and don't store the result in Qwik state.
 */
export function getDb(): Promise<Db> {
  dbPromise ??= open().catch((err) => {
    dbPromise = undefined;
    throw err;
  });
  return dbPromise;
}

async function open(): Promise<Db> {
  const { default: Database } = await import("@tauri-apps/plugin-sql");
  const sqlite = await Database.load("sqlite:remate.db");
  await runMigrations(sqlite);

  return drizzle(
    async (sql, params, method) => {
      if (method === "run") {
        await sqlite.execute(sql, params);
        return { rows: [] };
      }
      // The plugin returns rows as objects; Drizzle expects arrays in column
      // order. Columns with the same name (e.g. two `id`s in a join) collapse,
      // so alias them explicitly in `select({...})`.
      const rows = (
        await sqlite.select<Record<string, unknown>[]>(sql, params)
      ).map((row) => Object.values(row));
      // For "get", Drizzle expects the single row itself (undefined if none).
      return { rows: method === "get" ? (rows[0] as any) : rows };
    },
    { schema },
  );
}
