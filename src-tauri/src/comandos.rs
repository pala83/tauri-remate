use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::{State, WebviewWindow};
use tauri_plugin_sql::{DbInstances, DbPool};

const BASE: &str = "sqlite:remate.db";

/// The plugin's own pool, so a transaction here sees the same database.
fn sqlite(instancias: &HashMap<String, DbPool>) -> Result<&sqlx::SqlitePool, String> {
  match instancias.get(BASE) {
    Some(DbPool::Sqlite(pool)) => Ok(pool),
    _ => Err("La base de datos no está abierta.".into()),
  }
}

fn error(e: sqlx::Error) -> String {
  e.to_string()
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PagoNuevo {
  liquidacion_id: i64,
  cuota_id: Option<i64>,
  sentido: String,
  fecha: i64,
  monto: i64,
  medio: String,
  referencia: Option<String>,
  acredita: Option<i64>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LotePagado {
  remate_id: i64,
  lote_numero: i64,
  monto: i64,
}

/// A payment and the lots it covers: both are saved, or neither is.
#[tauri::command]
pub async fn registrar_pago(
  bases: State<'_, DbInstances>,
  pago: PagoNuevo,
  lotes: Vec<LotePagado>,
) -> Result<i64, String> {
  let instancias = bases.0.read().await;
  let mut tx = sqlite(&instancias)?.begin().await.map_err(error)?;
  let id = sqlx::query(
    "INSERT INTO pagos (liquidacion_id, cuota_id, sentido, fecha, monto, medio, referencia, acredita)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  )
  .bind(pago.liquidacion_id)
  .bind(pago.cuota_id)
  .bind(&pago.sentido)
  .bind(pago.fecha)
  .bind(pago.monto)
  .bind(&pago.medio)
  .bind(&pago.referencia)
  .bind(pago.acredita)
  .execute(&mut *tx)
  .await
  .map_err(error)?
  .last_insert_rowid();
  for lote in &lotes {
    sqlx::query("INSERT INTO pago_lotes (pago_id, remate_id, lote_numero, monto) VALUES (?, ?, ?, ?)")
      .bind(id)
      .bind(lote.remate_id)
      .bind(lote.lote_numero)
      .bind(lote.monto)
      .execute(&mut *tx)
      .await
      .map_err(error)?;
  }
  tx.commit().await.map_err(error)?;
  Ok(id)
}

/// A row of `pago_lotes`, as the frontend's `PagoLote`.
#[derive(Deserialize, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct PagoLoteFila {
  pago_id: i64,
  remate_id: i64,
  lote_numero: i64,
  monto: i64,
}

/// A sale that changes several lots, all at once or not at all:
/// - `soltar`: lots whose buyer changes; what was paid for them is removed and returned,
///   so it stays on the old buyer's account and "Deshacer" can put it back.
/// - `ventas`: the `VentaLote`s of `src/db/ventas.ts`, in one `UPDATE … FROM json_each`.
/// - Lots sold with one of them take its buyer, as the table's CHECK requires.
/// - `devolver`: payment rows put back, when undoing.
#[tauri::command]
pub async fn escribir_ventas(
  bases: State<'_, DbInstances>,
  remate_id: i64,
  ventas: serde_json::Value,
  soltar: Vec<i64>,
  devolver: Vec<PagoLoteFila>,
) -> Result<Vec<PagoLoteFila>, String> {
  let instancias = bases.0.read().await;
  let mut tx = sqlite(&instancias)?.begin().await.map_err(error)?;
  let soltados = if soltar.is_empty() {
    Vec::new()
  } else {
    sqlx::query_as::<_, PagoLoteFila>(
      "DELETE FROM pago_lotes
       WHERE remate_id = ? AND lote_numero IN (SELECT value FROM json_each(?))
       RETURNING pago_id, remate_id, lote_numero, monto",
    )
    .bind(remate_id)
    .bind(serde_json::to_string(&soltar).map_err(|e| e.to_string())?)
    .fetch_all(&mut *tx)
    .await
    .map_err(error)?
  };
  let ventas = ventas.to_string();
  sqlx::query(
    "UPDATE lotes SET
       comprador_id = j.comprador,
       precio_venta = j.precio,
       vendido_con = j.con,
       comision_compra = j.compra,
       comision_venta = j.venta
     FROM (
       SELECT
         json_extract(value, '$.numero') AS numero,
         json_extract(value, '$.compradorId') AS comprador,
         json_extract(value, '$.precioVenta') AS precio,
         json_extract(value, '$.vendidoCon') AS con,
         json_extract(value, '$.comisionCompra') AS compra,
         json_extract(value, '$.comisionVenta') AS venta
       FROM json_each(?)
     ) AS j
     WHERE lotes.remate_id = ? AND lotes.numero = j.numero",
  )
  .bind(&ventas)
  .bind(remate_id)
  .execute(&mut *tx)
  .await
  .map_err(error)?;
  sqlx::query(
    "UPDATE lotes SET comprador_id = p.comprador_id
     FROM lotes AS p
     WHERE lotes.remate_id = ?
       AND p.remate_id = lotes.remate_id
       AND p.numero = lotes.vendido_con
       AND p.comprador_id IS NOT NULL
       AND lotes.comprador_id IS NOT p.comprador_id
       AND p.numero IN (SELECT json_extract(value, '$.numero') FROM json_each(?))",
  )
  .bind(remate_id)
  .bind(&ventas)
  .execute(&mut *tx)
  .await
  .map_err(error)?;
  for fila in &devolver {
    sqlx::query("INSERT INTO pago_lotes (pago_id, remate_id, lote_numero, monto) VALUES (?, ?, ?, ?)")
      .bind(fila.pago_id)
      .bind(fila.remate_id)
      .bind(fila.lote_numero)
      .bind(fila.monto)
      .execute(&mut *tx)
      .await
      .map_err(error)?;
  }
  tx.commit().await.map_err(error)?;
  Ok(soltados)
}

/// Installments and payments of `se_va`'s settlements go to `queda`'s in the same remate.
const MOVER_CUOTAS: &str = "UPDATE cuotas SET liquidacion_id = q.id
  FROM liquidaciones AS v JOIN liquidaciones AS q ON q.remate_id = v.remate_id
  WHERE cuotas.liquidacion_id = v.id AND v.cliente_id = ? AND q.cliente_id = ?";
const MOVER_PAGOS: &str = "UPDATE pagos SET liquidacion_id = q.id
  FROM liquidaciones AS v JOIN liquidaciones AS q ON q.remate_id = v.remate_id
  WHERE pagos.liquidacion_id = v.id AND v.cliente_id = ? AND q.cliente_id = ?";
/// Then those settlements, now empty, are deleted.
const BORRAR_REPETIDAS: &str = "DELETE FROM liquidaciones
  WHERE cliente_id = ? AND remate_id IN (SELECT remate_id FROM liquidaciones WHERE cliente_id = ?)";
/// Every other row pointing at `se_va` points at `queda`.
const PASAR_LIQUIDACIONES: &str = "UPDATE liquidaciones SET cliente_id = ? WHERE cliente_id = ?";
const PASAR_DUENOS: &str = "UPDATE lotes SET dueno_id = ? WHERE dueno_id = ?";
const PASAR_COMPRADORES: &str = "UPDATE lotes SET comprador_id = ? WHERE comprador_id = ?";

/// Merges `se_va` into `queda`, all at once or not at all: every row that points at
/// `se_va` points at `queda`, and `se_va` is deleted. A settlement of both in the same
/// remate can't stay twice, so `se_va`'s installments, payments and notes join `queda`'s.
#[tauri::command]
pub async fn unificar_clientes(
  bases: State<'_, DbInstances>,
  queda: i64,
  se_va: i64,
) -> Result<(), String> {
  if queda == se_va {
    return Err("Es el mismo cliente.".into());
  }
  let instancias = bases.0.read().await;
  let mut tx = sqlite(&instancias)?.begin().await.map_err(error)?;
  let existen: i64 = sqlx::query_scalar("SELECT count(*) FROM clientes WHERE id IN (?, ?)")
    .bind(queda)
    .bind(se_va)
    .fetch_one(&mut *tx)
    .await
    .map_err(error)?;
  if existen != 2 {
    return Err("No se encontró el cliente.".into());
  }
  for sentencia in [MOVER_CUOTAS, MOVER_PAGOS] {
    sqlx::query(sentencia)
      .bind(se_va)
      .bind(queda)
      .execute(&mut *tx)
      .await
      .map_err(error)?;
  }
  sqlx::query(
    "UPDATE liquidaciones SET notas = CASE
       WHEN liquidaciones.notas IS NULL OR liquidaciones.notas = '' THEN v.notas
       ELSE liquidaciones.notas || char(10) || v.notas END
     FROM liquidaciones AS v
     WHERE liquidaciones.cliente_id = ? AND v.cliente_id = ?
       AND v.remate_id = liquidaciones.remate_id AND v.notas IS NOT NULL AND v.notas <> ''",
  )
  .bind(queda)
  .bind(se_va)
  .execute(&mut *tx)
  .await
  .map_err(error)?;
  sqlx::query(BORRAR_REPETIDAS)
    .bind(se_va)
    .bind(queda)
    .execute(&mut *tx)
    .await
    .map_err(error)?;
  for sentencia in [PASAR_LIQUIDACIONES, PASAR_DUENOS, PASAR_COMPRADORES] {
    sqlx::query(sentencia)
      .bind(queda)
      .bind(se_va)
      .execute(&mut *tx)
      .await
      .map_err(error)?;
  }
  sqlx::query("DELETE FROM clientes WHERE id = ?")
    .bind(se_va)
    .execute(&mut *tx)
    .await
    .map_err(error)?;
  tx.commit().await.map_err(error)
}

/// The webview's own `window.print()` isn't reliable on every platform.
#[tauri::command]
pub fn imprimir(ventana: WebviewWindow) -> Result<(), String> {
  ventana.print().map_err(|e| e.to_string())
}
