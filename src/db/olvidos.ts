import { olvidarConsultas } from "~/store";

/**
 * What each write makes stale in the store of `ver*`, called once the write is
 * over, even if it failed halfway. Every new write needs its line here and its
 * case in `tests/store-al-dia.test.ts`.
 */

/** A lot or a sale: that remate, the clients' counts and their histories. */
export const olvidarLotes = (remateId: number) =>
  olvidarConsultas(
    `remate-${remateId}-`,
    "clientes",
    "historial-",
    "remates-de-",
  );

/** Installments and payments: which remate isn't known without reading it. */
export const olvidarPagos = () => olvidarConsultas("remate-");

/** A settlement also adds its remate to the client's list. */
export const olvidarLiquidaciones = () =>
  olvidarConsultas("remate-", "remates-de-");

/** A remate's name or date shows in histories and each client's remates. */
export const olvidarRemates = () =>
  olvidarConsultas("remates-de-", "historial-");

/** A deleted remate: its own data and the lists it was in. */
export const olvidarRemate = (remateId: number) =>
  olvidarConsultas(`remate-${remateId}-`, "remates-de-", "historial-");

export const olvidarClientes = () => olvidarConsultas("clientes");

/** A client's name shows on lots, histories and settlements. */
export const olvidarTodo = () => olvidarConsultas("");
