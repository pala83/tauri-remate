import { $, useComputed$, useSignal, useTask$ } from "@builder.io/qwik";
import type { LiquidacionState } from "~/components/liquidacion/use-liquidacion";
import type { Mensaje } from "~/components/page-columns/form-message";
import { guardarCuotas } from "~/db/pagos";
import { repartirCuotas } from "~/lib/cuotas";
import { aPesos, errorTxt, plural } from "~/lib/textos";
import type { PlanCuotasState } from "./use-plan-cuotas";

export const usePlanForm = (
  estado: LiquidacionState,
  { abierto, borrador, mensaje }: PlanCuotasState,
) => {
  const antes = borrador.value;
  const plazos = useSignal<number[]>(antes?.plazos ?? [0, 30, 60]);
  const lote = useSignal<number | null>(antes?.lote ?? null);
  const porLote = useSignal(antes?.porLote ?? false);
  const monto = useSignal(antes?.monto ?? "");
  const error = useSignal<Mensaje>();
  const compras = useComputed$(() =>
    (estado.liq.value?.compras ?? []).filter((c) => c.resta > 0),
  );
  const base = useComputed$(() =>
    porLote.value
      ? (compras.value.find((c) => c.numero === lote.value)?.resta ?? 0)
      : Math.max(0, estado.liq.value?.saldo ?? 0),
  );
  // Kept by `PlanCuotas`, so it's still there after another tab.
  useTask$(({ track }) => {
    borrador.value = {
      plazos: track(() => plazos.value),
      lote: track(() => lote.value),
      porLote: track(() => porLote.value),
      monto: track(() => monto.value),
    };
  });
  const vista = useComputed$(() =>
    repartirCuotas(
      aPesos(monto.value) || base.value,
      plazos.value,
      estado.remate.value?.fecha ?? new Date(),
    ),
  );

  const guardar = $(async () => {
    const remateId = estado.remateId.value;
    const falla = (texto: string) => {
      error.value = { tipo: "error", texto };
    };
    // The preview is from the screen; what's saved, from the database.
    let vigente;
    try {
      vigente = await estado.vigente();
    } catch (err) {
      return falla(errorTxt(err));
    }
    const liq = vigente?.liq.liq;
    if (!vigente || !liq || remateId === null) return;
    if (plazos.value.length === 0) return falla("Elegí al menos un plazo.");
    if (porLote.value && lote.value === null)
      return falla("Elegí el lote del plan.");
    const resta = porLote.value
      ? (vigente.liq.compras.find((c) => c.numero === lote.value)?.resta ?? 0)
      : Math.max(0, vigente.liq.saldo);
    const cuotas = repartirCuotas(
      aPesos(monto.value) || resta,
      plazos.value,
      vigente.remate.fecha,
    );
    if (!cuotas.some((c) => c.monto > 0))
      return falla("El monto del plan tiene que ser mayor que 0.");
    if (cuotas.some((c) => c.monto <= 0))
      return falla("El monto no alcanza para tantas cuotas.");
    const filas = cuotas.map((c) => ({
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
      texto: `Plan de ${plural(filas.length, "cuota")} guardado.`,
    };
  });

  return { plazos, lote, porLote, monto, error, compras, base, vista, guardar };
};

export type PlanFormState = ReturnType<typeof usePlanForm>;
