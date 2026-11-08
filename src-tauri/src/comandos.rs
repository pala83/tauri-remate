use serde::Deserialize;
use tauri::{State, WebviewWindow};
use tauri_plugin_sql::{DbInstances, DbPool};

const BASE: &str = "sqlite:remate.db";

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
  let pool = match instancias.get(BASE) {
    Some(DbPool::Sqlite(pool)) => pool,
    _ => return Err("La base de datos no está abierta.".into()),
  };
  let error = |e: sqlx::Error| e.to_string();
  let mut tx = pool.begin().await.map_err(error)?;
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

/// The webview's own `window.print()` isn't reliable on every platform.
#[tauri::command]
pub fn imprimir(ventana: WebviewWindow) -> Result<(), String> {
  ventana.print().map_err(|e| e.to_string())
}
