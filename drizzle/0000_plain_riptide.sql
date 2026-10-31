CREATE TABLE `remates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`titulo` text NOT NULL,
	`fecha` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
