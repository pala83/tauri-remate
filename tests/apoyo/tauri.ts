/**
 * The Rust commands, run with the SQL taken from `src-tauri/src/comandos.rs`
 * itself: if the Rust changes, these change with it.
 */
import type { Database } from "bun:sqlite";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const fuente = readFileSync(
  join(import.meta.dir, "../../src-tauri/src/comandos.rs"),
  "utf8",
);
const sentencias = [
  ...fuente.matchAll(
    /(?:sqlx::query(?:_as|_scalar)?(?:::<[^>]+>)?\(|: &str =)\s*"((?:[^"\\]|\\.)*)"/g,
  ),
].map((m) => m[1].replace(/\\"/g, '"'));

const sql = (empieza: string, contiene = "") => {
  const hallada = sentencias.find(
    (s) => s.trimStart().startsWith(empieza) && s.includes(contiene),
  );
  if (!hallada) throw new Error(`No está en comandos.rs: ${empieza}…`);
  return hallada;
};

const INSERTAR_PAGO = sql("INSERT INTO pagos");
const INSERTAR_PAGO_LOTE = sql("INSERT INTO pago_lotes");
const SOLTAR = sql("DELETE FROM pago_lotes");
const VENDER = sql("UPDATE lotes SET", "$.compradorId");
const HEREDAR = sql("UPDATE lotes SET comprador_id = p.comprador_id");
const UNIFICAR = {
  existen: sql("SELECT count(*) FROM clientes"),
  cuotas: sql("UPDATE cuotas SET liquidacion_id"),
  pagos: sql("UPDATE pagos SET liquidacion_id"),
  notas: sql("UPDATE liquidaciones SET notas"),
  repetidas: sql("DELETE FROM liquidaciones"),
  liquidaciones: sql("UPDATE liquidaciones SET cliente_id"),
  duenos: sql("UPDATE lotes SET dueno_id"),
  compradores: sql("UPDATE lotes SET comprador_id = ?"),
  borrar: sql("DELETE FROM clientes"),
};

type Fila = {
  pagoId: number;
  remateId: number;
  loteNumero: number;
  monto: number;
};
type Args = Record<string, any>;

export const comandos: Record<string, (db: Database, a: Args) => unknown> = {
  registrar_pago: (db, { pago, lotes }) =>
    db.transaction(() => {
      const { lastInsertRowid } = db
        .query(INSERTAR_PAGO)
        .run(
          pago.liquidacionId,
          pago.cuotaId ?? null,
          pago.sentido,
          pago.fecha,
          pago.monto,
          pago.medio,
          pago.referencia ?? null,
          pago.acredita ?? null,
        );
      for (const l of lotes as Fila[])
        db.query(INSERTAR_PAGO_LOTE).run(
          lastInsertRowid,
          l.remateId,
          l.loteNumero,
          l.monto,
        );
      return Number(lastInsertRowid);
    })(),

  escribir_ventas: (db, { remateId, ventas, soltar, devolver }) =>
    db.transaction(() => {
      const soltados = soltar.length
        ? db
            .query<
              {
                pago_id: number;
                remate_id: number;
                lote_numero: number;
                monto: number;
              },
              any[]
            >(SOLTAR)
            .all(remateId, JSON.stringify(soltar))
            .map((f) => ({
              pagoId: f.pago_id,
              remateId: f.remate_id,
              loteNumero: f.lote_numero,
              monto: f.monto,
            }))
        : [];
      const json = JSON.stringify(ventas);
      db.query(VENDER).run(json, remateId);
      db.query(HEREDAR).run(remateId, json);
      for (const f of devolver as Fila[])
        db.query(INSERTAR_PAGO_LOTE).run(
          f.pagoId,
          f.remateId,
          f.loteNumero,
          f.monto,
        );
      return soltados;
    })(),

  unificar_clientes: (db, { queda, seVa }) =>
    db.transaction(() => {
      if (queda === seVa) throw new Error("Es el mismo cliente.");
      const { n } = db
        .query<
          { n: number },
          any[]
        >(UNIFICAR.existen.replace("count(*)", "count(*) AS n"))
        .get(queda, seVa)!;
      if (n !== 2) throw new Error("No se encontró el cliente.");
      db.query(UNIFICAR.cuotas).run(seVa, queda);
      db.query(UNIFICAR.pagos).run(seVa, queda);
      db.query(UNIFICAR.notas).run(queda, seVa);
      db.query(UNIFICAR.repetidas).run(seVa, queda);
      db.query(UNIFICAR.liquidaciones).run(queda, seVa);
      db.query(UNIFICAR.duenos).run(queda, seVa);
      db.query(UNIFICAR.compradores).run(queda, seVa);
      db.query(UNIFICAR.borrar).run(seVa);
    })(),
};
