import { component$ } from "@builder.io/qwik";
import type { LiquidacionState } from "~/components/liquidacion/use-liquidacion";
import { SectionHeading } from "~/components/page-columns/section-heading";
import { PagoForm } from "./pago-form";
import { PagosRegistrados } from "./pagos-registrados";
import { PlanCuotas } from "./plan-cuotas";

export const PagosSeccion = component$<{ estado: LiquidacionState }>(
  ({ estado }) => {
    return (
      <>
        <SectionHeading id="pagos" title="Pagos" />
        {estado.liq.value?.liq ? (
          <div class="flex flex-col gap-7">
            <PagoForm key={estado.liq.value.liq.id} estado={estado} />
            <PlanCuotas
              key={`plan-${estado.liq.value.liq.id}`}
              estado={estado}
            />
            <PagosRegistrados estado={estado} />
          </div>
        ) : (
          <p class="text-muted-foreground text-lg italic">
            Para registrar pagos, primero generá la liquidación de este remate.
          </p>
        )}
      </>
    );
  },
);
