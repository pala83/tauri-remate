CREATE TABLE `cuotas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`liquidacion_id` integer NOT NULL,
	`remate_id` integer,
	`lote_numero` integer,
	`plazo_dias` integer NOT NULL,
	`vence` integer NOT NULL,
	`monto` integer NOT NULL,
	FOREIGN KEY (`liquidacion_id`) REFERENCES `liquidaciones`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`remate_id`,`lote_numero`) REFERENCES `lotes`(`remate_id`,`numero`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "cuotas_lote_check" CHECK(("cuotas"."remate_id" IS NULL) = ("cuotas"."lote_numero" IS NULL)),
	CONSTRAINT "cuotas_plazo_check" CHECK("cuotas"."plazo_dias" >= 0),
	CONSTRAINT "cuotas_monto_check" CHECK("cuotas"."monto" > 0)
);
--> statement-breakpoint
CREATE INDEX `cuotas_liquidacion_idx` ON `cuotas` (`liquidacion_id`);--> statement-breakpoint
CREATE INDEX `cuotas_lote_idx` ON `cuotas` (`remate_id`,`lote_numero`);--> statement-breakpoint
CREATE TABLE `liquidaciones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`remate_id` integer NOT NULL,
	`cliente_id` integer NOT NULL,
	`sin_comision` integer DEFAULT false NOT NULL,
	`notas` text,
	FOREIGN KEY (`remate_id`) REFERENCES `remates`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `liquidaciones_remate_cliente_idx` ON `liquidaciones` (`remate_id`,`cliente_id`);--> statement-breakpoint
CREATE INDEX `liquidaciones_cliente_idx` ON `liquidaciones` (`cliente_id`);--> statement-breakpoint
CREATE TABLE `pago_lotes` (
	`pago_id` integer NOT NULL,
	`remate_id` integer NOT NULL,
	`lote_numero` integer NOT NULL,
	`monto` integer NOT NULL,
	PRIMARY KEY(`pago_id`, `remate_id`, `lote_numero`),
	FOREIGN KEY (`pago_id`) REFERENCES `pagos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`remate_id`,`lote_numero`) REFERENCES `lotes`(`remate_id`,`numero`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "pago_lotes_monto_check" CHECK("pago_lotes"."monto" > 0)
);
--> statement-breakpoint
CREATE INDEX `pago_lotes_lote_idx` ON `pago_lotes` (`remate_id`,`lote_numero`);--> statement-breakpoint
CREATE TABLE `pagos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`liquidacion_id` integer NOT NULL,
	`cuota_id` integer,
	`sentido` text NOT NULL,
	`fecha` integer NOT NULL,
	`monto` integer NOT NULL,
	`medio` text NOT NULL,
	`referencia` text,
	`acredita` integer,
	`anulado` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`liquidacion_id`) REFERENCES `liquidaciones`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`cuota_id`) REFERENCES `cuotas`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "pagos_monto_check" CHECK("pagos"."monto" > 0),
	CONSTRAINT "pagos_sentido_check" CHECK("pagos"."sentido" IN ('cobro', 'pago')),
	CONSTRAINT "pagos_medio_check" CHECK("pagos"."medio" IN ('efectivo', 'transferencia', 'cheque', 'otro'))
);
--> statement-breakpoint
CREATE INDEX `pagos_liquidacion_idx` ON `pagos` (`liquidacion_id`);--> statement-breakpoint
CREATE INDEX `pagos_cuota_idx` ON `pagos` (`cuota_id`);--> statement-breakpoint
CREATE TABLE `__new_lotes` (
	`remate_id` integer NOT NULL,
	`numero` integer NOT NULL,
	`dueno_id` integer NOT NULL,
	`comprador_id` integer,
	`nombre` text NOT NULL,
	`cantidad` integer,
	`materiales` text,
	`marca` text,
	`funciona` integer,
	`es_nuevo` integer,
	`precio_base` integer,
	`imagen` text,
	`precio_venta` integer,
	`vendido_con` integer,
	`comision_compra` integer DEFAULT 1000 NOT NULL,
	`comision_venta` integer DEFAULT 1000 NOT NULL,
	PRIMARY KEY(`remate_id`, `numero`),
	FOREIGN KEY (`remate_id`) REFERENCES `remates`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`dueno_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`comprador_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`remate_id`,`vendido_con`) REFERENCES `__new_lotes`(`remate_id`,`numero`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "lotes_numero_check" CHECK("__new_lotes"."numero" >= 1),
	CONSTRAINT "lotes_venta_check" CHECK(("__new_lotes"."comprador_id" IS NULL) = ("__new_lotes"."precio_venta" IS NULL AND "__new_lotes"."vendido_con" IS NULL)),
	CONSTRAINT "lotes_vendido_con_check" CHECK("__new_lotes"."precio_venta" IS NULL OR "__new_lotes"."vendido_con" IS NULL),
	CONSTRAINT "lotes_comision_compra_check" CHECK("__new_lotes"."comision_compra" BETWEEN 0 AND 10000),
	CONSTRAINT "lotes_comision_venta_check" CHECK("__new_lotes"."comision_venta" BETWEEN 0 AND 10000)
);
--> statement-breakpoint
INSERT INTO `__new_lotes`("remate_id", "numero", "dueno_id", "comprador_id", "nombre", "cantidad", "materiales", "marca", "funciona", "es_nuevo", "precio_base", "imagen", "precio_venta", "vendido_con", "comision_compra", "comision_venta") SELECT "remate_id", "numero", "dueno_id", "comprador_id", "nombre", "cantidad", "materiales", "marca", "funciona", "es_nuevo", "precio_base", "imagen", "precio_venta", "vendido_con", 1000, 1000 FROM `lotes`;--> statement-breakpoint
UPDATE `lotes` SET `comprador_id` = NULL, `precio_venta` = NULL, `vendido_con` = NULL, `pagado` = 0;--> statement-breakpoint
DROP TABLE `lotes`;--> statement-breakpoint
ALTER TABLE `__new_lotes` RENAME TO `lotes`;--> statement-breakpoint
CREATE INDEX `lotes_dueno_idx` ON `lotes` (`dueno_id`);--> statement-breakpoint
CREATE INDEX `lotes_comprador_idx` ON `lotes` (`comprador_id`);--> statement-breakpoint
ALTER TABLE `clientes` ADD `sin_comision` integer DEFAULT false NOT NULL;