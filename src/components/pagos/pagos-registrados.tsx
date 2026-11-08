import { $, component$, useComputed$, useSignal } from "@builder.io/qwik";
import type { LiquidacionState } from "~/components/liquidacion/use-liquidacion";
import {
  FormMessage,
  type Mensaje,
} from "~/components/page-columns/form-message";
import { Card } from "~/components/ui";
import { anularPago } from "~/db/pagos";
import { fechaCorta } from "~/lib/fechas";
import { errorTxt, pesos } from "~/lib/textos";
import { cuotasDe } from "./cuotas-de";
import { PagoFila } from "./pago-fila";

export const PagosRegistrados = component$<{ estado: LiquidacionState }>(
  ({ estado }) => {
    const mensaje = useSignal<Mensaje>();
    const filas = useComputed$(() => {
      const cuotas = cuotasDe(estado);
      return (estado.liq.value?.pagos ?? []).map((pago) => {
        const lotes = (estado.datos.value?.pagoLotes ?? [])
          .filter((pl) => pl.pagoId === pago.id)
          .map((pl) => pl.loteNumero);
        const cuota = cuotas.find((c) => c.cuota.id === pago.cuotaId);
        const aplica = cuota
          ? `cuota ${cuota.orden}`
          : lotes.length
            ? `lotes N° ${lotes.join(", ")}`
            : "a cuenta";
        return {
          pago,
          detalle:
            aplica +
            (pago.acredita ? ` · acredita ${fechaCorta(pago.acredita)}` : ""),
        };
      });
    });
    const resumen = useComputed$(() => {
      const liq = estado.liq.value;
      if (!liq) return "";
      const n =
        liq.nPagos === 1 ? "1 pago válido" : `${liq.nPagos} pagos válidos`;
      return `${n} · cobrado ${pesos(liq.cobros)}${liq.pagosAl ? ` · pagado ${pesos(liq.pagosAl)}` : ""}`;
    });

    const anular = $(async (id: number) => {
      try {
        await estado.hacer($(() => anularPago(id)));
        mensaje.value = {
          tipo: "ok",
          texto:
            "Pago anulado: queda en el registro, pero ya no descuenta del saldo.",
        };
      } catch (err) {
        mensaje.value = { tipo: "error", texto: errorTxt(err) };
      }
    });

    return (
      <Card.Root
        class="overflow-hidden shadow-lg"
        aria-label="Pagos registrados"
      >
        <header class="bg-muted flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5 border-b px-6 py-4">
          <h3 class="font-serif text-2xl">Pagos registrados</h3>
          <span class="text-muted-foreground font-mono text-sm">
            {resumen.value}
          </span>
        </header>
        {filas.value.length > 0 && (
          <ul class="overflow-x-auto">
            {filas.value.map(({ pago, detalle }) => (
              <PagoFila
                key={pago.id}
                pago={pago}
                detalle={detalle}
                onAnular$={anular}
              />
            ))}
          </ul>
        )}
        {filas.value.length === 0 && (
          <p class="text-muted-foreground px-6 py-4.5 italic">
            Todavía no hay pagos registrados en este remate.
          </p>
        )}
        {mensaje.value && (
          <div class="px-6 py-3">
            <FormMessage mensaje={mensaje.value} />
          </div>
        )}
      </Card.Root>
    );
  },
);
