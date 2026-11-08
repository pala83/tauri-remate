import { pesos } from "~/lib/textos";

export const claseSaldo = (saldo: number) =>
  saldo > 0
    ? "text-alert"
    : saldo < 0
      ? "text-sidebar-accent"
      : "text-muted-foreground";

export const etiquetaSaldo = (saldo: number) =>
  saldo > 0
    ? "Saldo · debe"
    : saldo < 0
      ? "Saldo · a pagarle"
      : "Saldo · al día";

/** How a client's balance reads in a list. */
export const saldoCorto = (saldo: number, hayMovimientos: boolean) => {
  if (!hayMovimientos) return "—";
  if (saldo > 0) return `debe ${pesos(saldo)}`;
  return saldo < 0 ? `a pagar ${pesos(saldo)}` : "al día";
};
