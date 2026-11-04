PRAGMA foreign_keys=OFF;--> statement-breakpoint
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
	`pagado` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`remate_id`, `numero`),
	FOREIGN KEY (`remate_id`) REFERENCES `remates`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`dueno_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`comprador_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`remate_id`,`vendido_con`) REFERENCES `lotes`(`remate_id`,`numero`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "lotes_numero_check" CHECK("__new_lotes"."numero" >= 1),
	CONSTRAINT "lotes_venta_check" CHECK(("__new_lotes"."comprador_id" IS NULL) = ("__new_lotes"."precio_venta" IS NULL AND "__new_lotes"."vendido_con" IS NULL)),
	CONSTRAINT "lotes_vendido_con_check" CHECK("__new_lotes"."precio_venta" IS NULL OR "__new_lotes"."vendido_con" IS NULL),
	CONSTRAINT "lotes_pagado_check" CHECK("__new_lotes"."pagado" = 0 OR "__new_lotes"."precio_venta" IS NOT NULL OR "__new_lotes"."vendido_con" IS NOT NULL)
);
--> statement-breakpoint
INSERT INTO `__new_lotes`("remate_id", "numero", "dueno_id", "comprador_id", "nombre", "cantidad", "materiales", "marca", "funciona", "es_nuevo", "precio_base", "imagen", "precio_venta", "vendido_con", "pagado") SELECT "remate_id", "numero", "dueno_id", "comprador_id", "nombre", "cantidad", "materiales", "marca", "funciona", "es_nuevo", "precio_base", "imagen", "precio_venta", NULL, "pagado" FROM `lotes`;--> statement-breakpoint
DROP TABLE `lotes`;--> statement-breakpoint
ALTER TABLE `__new_lotes` RENAME TO `lotes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `lotes_dueno_idx` ON `lotes` (`dueno_id`);--> statement-breakpoint
CREATE INDEX `lotes_comprador_idx` ON `lotes` (`comprador_id`);