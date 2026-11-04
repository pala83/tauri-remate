ALTER TABLE `remates` RENAME COLUMN "titulo" TO "nombre";--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`referido` text,
	`telefono` text,
	`email` text
);
--> statement-breakpoint
CREATE TABLE `lotes` (
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
	`pagado` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`remate_id`, `numero`),
	FOREIGN KEY (`remate_id`) REFERENCES `remates`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`dueno_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`comprador_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "lotes_numero_check" CHECK("lotes"."numero" >= 1),
	CONSTRAINT "lotes_venta_check" CHECK(("lotes"."comprador_id" IS NULL) = ("lotes"."precio_venta" IS NULL)),
	CONSTRAINT "lotes_pagado_check" CHECK("lotes"."pagado" = 0 OR "lotes"."precio_venta" IS NOT NULL)
);
--> statement-breakpoint
ALTER TABLE `remates` ADD `lugar` text;--> statement-breakpoint
ALTER TABLE `remates` DROP COLUMN `created_at`;