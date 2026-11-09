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

/** -500 -> "− $ 500": an amount that subtracts, as the totals show it. */
export const firmado = (n: number) => `${n < 0 ? "− " : ""}${pesos(n)}`;

/** What the payment form suggests, from the balance. */
export const sugerenciaSaldo = (saldo: number) => {
  if (saldo > 0) return `Debe ${pesos(saldo)}`;
  return saldo < 0 ? `Hay que pagarle ${pesos(saldo)}` : "Cuenta al día";
};

/** What a payment in that direction should be to leave the balance at 0, as typed in the field. */
export const montoSugerido = (saldo: number, sentido: "cobro" | "pago") => {
  const monto = sentido === "cobro" ? saldo : -saldo;
  return monto > 0 ? pesos(monto) : "";
};

/** How a client's balance reads in a list. */
export const saldoCorto = (saldo: number, hayMovimientos: boolean) => {
  if (!hayMovimientos) return "—";
  if (saldo > 0) return `debe ${pesos(saldo)}`;
  return saldo < 0 ? `a pagar ${pesos(saldo)}` : "al día";
};
