import { errorTxt } from "~/lib/textos";

/** What SQLite said, also when Drizzle wraps it in an error of its own. */
export const textoDeBase = (err: unknown) =>
  errorTxt(err) +
  (err instanceof Error && err.cause ? ` ${errorTxt(err.cause)}` : "");
