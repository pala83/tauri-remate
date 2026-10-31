import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  // Only used by `drizzle-kit studio`; migrations are applied by the app (src/db/migrate.ts).
  dbCredentials: {
    url: process.env.DB_PATH ?? "",
  },
});
