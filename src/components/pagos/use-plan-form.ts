import { $, useComputed$, useSignal, type Signal } from "@builder.io/qwik";
import type { LiquidacionState } from "~/components/liquidacion/use-liquidacion";
import type { Mensaje } from "~/components/page-columns/form-message";
import { guardarCuotas } from "~/db/pagos";
import { repartirCuotas } from "~/lib/cuotas";
import { aPesos, errorTxt } from "~/lib/textos";

export const usePlanForm = (
  estado: LiquidacionState,
  abierto: Signal<boolean>,
  mensaje: Signal<Mensaje | undefined>,
) => {
  const plazos = useSignal<number[]>([0, 30, 60]);
  const lote = useSignal<number | null>(null);
  const porLote = useSignal(false);
  const monto = useSignal("");
  const error = useSignal<Mensaje>();
  const compras = useComputed$(() =>
    (estado.liq.value?.compras ?? []).filter((c) => c.resta > 0),
  );
  const base = useComputed$(() =>
    porLote.value
      ? (compras.value.find((c) => c.numero === lote.value)?.resta ?? 0)
      : Math.max(0, estado.liq.value?.saldo ?? 0),
  );
  const vista = useComputed$(() =>
    repartirCuotas(
      aPesos(monto.value) || base.value,
      plazos.value,
      estado.remate.value?.fecha ?? new Date(),
    ),
  );

  const guardar = $(async () => {
    const liq = estado.liq.value?.liq;
    const remateId = estado.remateId.value;
    if (!liq || remateId === null) return;
    const falla = (texto: string) => {
      error.value = { tipo: "error", texto };
    };
    if (plazos.value.length === 0) return falla("Elegí al menos un plazo.");
    if (porLote.value && lote.value === null)
      return falla("Elegí el lote del plan.");
    if (!vista.value.some((c) => c.monto > 0))
      return falla("El monto del plan tiene que ser mayor que 0.");
    if (vista.value.some((c) => c.monto <= 0))
      return falla("El monto no alcanza para tantas cuotas.");
    const filas = vista.value.map((c) => ({
      ...c,
      liquidacionId: liq.id,
      remateId: porLote.value ? remateId : null,
      loteNumero: porLote.value ? lote.value : null,
    }));
    try {
      await estado.hacer($(() => guardarCuotas(filas)));
    } catch (err) {
      return falla(errorTxt(err));
    }
    abierto.value = false;
    mensaje.value = {
      tipo: "ok",
      texto: `Plan de ${filas.length} ${filas.length === 1 ? "cuota" : "cuotas"} guardado.`,
    };
  });

  return { plazos, lote, porLote, monto, error, compras, base, vista, guardar };
};

export type PlanFormState = ReturnType<typeof usePlanForm>;
