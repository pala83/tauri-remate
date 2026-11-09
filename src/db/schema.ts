import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const remates = sqliteTable("remates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  fecha: integer("fecha", { mode: "timestamp" }).notNull(),
  lugar: text("lugar"),
});

export const clientes = sqliteTable(
  "clientes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Unique: renaming a client to another's name unifies them. */
    nombre: text("nombre").notNull(),
    referido: text("referido"),
    telefono: text("telefono"),
    email: text("email"),
    /** Copied to each new settlement, e.g. an NGO or a school. */
    sinComision: integer("sin_comision", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (t) => [uniqueIndex("clientes_nombre_idx").on(t.nombre)],
);

export const lotes = sqliteTable(
  "lotes",
  {
    remateId: integer("remate_id")
      .notNull()
      .references(() => remates.id, { onDelete: "restrict" }),
    numero: integer("numero").notNull(),
    duenoId: integer("dueno_id")
      .notNull()
      .references(() => clientes.id, { onDelete: "restrict" }),
    compradorId: integer("comprador_id").references(() => clientes.id, {
      onDelete: "restrict",
    }),
    nombre: text("nombre").notNull(),
    cantidad: integer("cantidad"),
    materiales: text("materiales"),
    marca: text("marca"),
    funciona: integer("funciona", { mode: "boolean" }),
    esNuevo: integer("es_nuevo", { mode: "boolean" }),
    precioBase: integer("precio_base"),
    imagen: text("imagen"),
    precioVenta: integer("precio_venta"),
    /** The lot holding the price, when both were sold together for one price. */
    vendidoCon: integer("vendido_con"),
    /** Commission of each side, in hundredths of a percent: 1000 = 10%. */
    comisionCompra: integer("comision_compra").notNull().default(1000),
    comisionVenta: integer("comision_venta").notNull().default(1000),
  },
  (t) => [
    primaryKey({ columns: [t.remateId, t.numero] }),
    foreignKey({
      columns: [t.remateId, t.vendidoCon],
      foreignColumns: [t.remateId, t.numero],
    }).onDelete("restrict"),
    index("lotes_dueno_idx").on(t.duenoId),
    index("lotes_comprador_idx").on(t.compradorId),
    check("lotes_numero_check", sql`${t.numero} >= 1`),
    check(
      "lotes_venta_check",
      sql`(${t.compradorId} IS NULL) = (${t.precioVenta} IS NULL AND ${t.vendidoCon} IS NULL)`,
    ),
    check(
      "lotes_vendido_con_check",
      sql`${t.precioVenta} IS NULL OR ${t.vendidoCon} IS NULL`,
    ),
    check(
      "lotes_comision_compra_check",
      sql`${t.comisionCompra} BETWEEN 0 AND 10000`,
    ),
    check(
      "lotes_comision_venta_check",
      sql`${t.comisionVenta} BETWEEN 0 AND 10000`,
    ),
  ],
);

/**
 * What can't be calculated about a client's settlement in a remate. Its amounts
 * are always calculated from the lots, so correcting a lot corrects them.
 */
export const liquidaciones = sqliteTable(
  "liquidaciones",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    remateId: integer("remate_id")
      .notNull()
      .references(() => remates.id, { onDelete: "restrict" }),
    clienteId: integer("cliente_id")
      .notNull()
      .references(() => clientes.id, { onDelete: "restrict" }),
    sinComision: integer("sin_comision", { mode: "boolean" })
      .notNull()
      .default(false),
    notas: text("notas"),
  },
  (t) => [
    uniqueIndex("liquidaciones_remate_cliente_idx").on(t.remateId, t.clienteId),
    index("liquidaciones_cliente_idx").on(t.clienteId),
  ],
);

/** A promised payment. With a lot it belongs to that lot, without one to the account. */
export const cuotas = sqliteTable(
  "cuotas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    liquidacionId: integer("liquidacion_id")
      .notNull()
      .references(() => liquidaciones.id, { onDelete: "restrict" }),
    remateId: integer("remate_id"),
    loteNumero: integer("lote_numero"),
    plazoDias: integer("plazo_dias").notNull(),
    vence: integer("vence", { mode: "timestamp" }).notNull(),
    monto: integer("monto").notNull(),
  },
  (t) => [
    foreignKey({
      columns: [t.remateId, t.loteNumero],
      foreignColumns: [lotes.remateId, lotes.numero],
    }).onDelete("restrict"),
    index("cuotas_liquidacion_idx").on(t.liquidacionId),
    index("cuotas_lote_idx").on(t.remateId, t.loteNumero),
    check(
      "cuotas_lote_check",
      sql`(${t.remateId} IS NULL) = (${t.loteNumero} IS NULL)`,
    ),
    check("cuotas_plazo_check", sql`${t.plazoDias} >= 0`),
    check("cuotas_monto_check", sql`${t.monto} > 0`),
  ],
);

/** Money that moved: `cobro` when the client pays, `pago` when a client is paid. */
export const pagos = sqliteTable(
  "pagos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    liquidacionId: integer("liquidacion_id")
      .notNull()
      .references(() => liquidaciones.id, { onDelete: "restrict" }),
    cuotaId: integer("cuota_id").references(() => cuotas.id, {
      onDelete: "restrict",
    }),
    sentido: text("sentido", { enum: ["cobro", "pago"] }).notNull(),
    fecha: integer("fecha", { mode: "timestamp" }).notNull(),
    monto: integer("monto").notNull(),
    medio: text("medio", {
      enum: ["efectivo", "transferencia", "cheque", "otro"],
    }).notNull(),
    referencia: text("referencia"),
    /** When a check can be cashed. */
    acredita: integer("acredita", { mode: "timestamp" }),
    /** A bounced check is annulled, not deleted. */
    anulado: integer("anulado", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [
    index("pagos_liquidacion_idx").on(t.liquidacionId),
    index("pagos_cuota_idx").on(t.cuotaId),
    check("pagos_monto_check", sql`${t.monto} > 0`),
    check("pagos_sentido_check", sql`${t.sentido} IN ('cobro', 'pago')`),
    check(
      "pagos_medio_check",
      sql`${t.medio} IN ('efectivo', 'transferencia', 'cheque', 'otro')`,
    ),
  ],
);

/** How much of a payment covers each lot. */
export const pagoLotes = sqliteTable(
  "pago_lotes",
  {
    pagoId: integer("pago_id")
      .notNull()
      .references(() => pagos.id, { onDelete: "cascade" }),
    remateId: integer("remate_id").notNull(),
    loteNumero: integer("lote_numero").notNull(),
    monto: integer("monto").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.pagoId, t.remateId, t.loteNumero] }),
    foreignKey({
      columns: [t.remateId, t.loteNumero],
      foreignColumns: [lotes.remateId, lotes.numero],
    }).onDelete("restrict"),
    index("pago_lotes_lote_idx").on(t.remateId, t.loteNumero),
    check("pago_lotes_monto_check", sql`${t.monto} > 0`),
  ],
);

export type Remate = typeof remates.$inferSelect;
export type NewRemate = typeof remates.$inferInsert;
export type Cliente = typeof clientes.$inferSelect;
export type NewCliente = typeof clientes.$inferInsert;
export type Lote = typeof lotes.$inferSelect;
export type NewLote = typeof lotes.$inferInsert;
export type Liquidacion = typeof liquidaciones.$inferSelect;
export type NewLiquidacion = typeof liquidaciones.$inferInsert;
export type Cuota = typeof cuotas.$inferSelect;
export type NewCuota = typeof cuotas.$inferInsert;
export type Pago = typeof pagos.$inferSelect;
export type NewPago = typeof pagos.$inferInsert;
export type PagoLote = typeof pagoLotes.$inferSelect;
export type NewPagoLote = typeof pagoLotes.$inferInsert;
