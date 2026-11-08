import { component$, useComputed$ } from "@builder.io/qwik";
import { Chip } from "~/components/chip/chip";
import type { LiquidacionState } from "~/components/liquidacion/use-liquidacion";
import { Segmentado } from "~/components/segmentado/segmentado";
import { pesos } from "~/lib/textos";
import { cuotasDe } from "./cuotas-de";
import type { PagoFormState } from "./use-pago-form";

type AplicaProps = { form: PagoFormState; estado: LiquidacionState };

/** What a payment covers. Only a client's payment can go to lots or installments. */
export const PagoAplica = component$<AplicaProps>(({ form, estado }) => {
  const impagos = useComputed$(() =>
    (estado.liq.value?.compras ?? []).filter((c) => c.resta > 0),
  );
  const cuotas = useComputed$(() =>
    cuotasDe(estado).filter((c) => c.resta > 0),
  );
  const opciones = useComputed$(() => [
    { valor: "cuenta", texto: "A cuenta" },
    ...(form.sentido === "cobro" && impagos.value.length
      ? [{ valor: "lotes", texto: "Lotes" }]
      : []),
    ...(form.sentido === "cobro" && cuotas.value.length
      ? [{ valor: "cuota", texto: "Una cuota" }]
      : []),
  ]);
  const aplica = useComputed$(() =>
    opciones.value.some((o) => o.valor === form.aplica)
      ? form.aplica
      : "cuenta",
  );

  return (
    <div class="flex flex-col gap-2">
      <span class="font-mono text-sm font-bold">Se aplica a</span>
      <Segmentado
        etiqueta="Se aplica a"
        valor={aplica.value}
        opciones={opciones.value}
        onElegir$={(valor) => {
          form.aplica = valor as PagoFormState["aplica"];
        }}
      />
      {aplica.value === "lotes" && (
        <div class="mt-1 flex flex-wrap gap-2.5">
          {impagos.value.map((c) => (
            <Chip
              key={c.numero}
              activo={form.lotes.includes(c.numero)}
              onCambiar$={() => {
                form.lotes = form.lotes.includes(c.numero)
                  ? form.lotes.filter((n) => n !== c.numero)
                  : [...form.lotes, c.numero];
              }}
            >
              N° {c.numero} · {pesos(c.resta)}
            </Chip>
          ))}
        </div>
      )}
      {aplica.value === "cuota" && (
        <div class="mt-1 flex flex-col items-start gap-2.5">
          {cuotas.value.map((c) => (
            <Chip
              key={c.cuota.id}
              redondo
              activo={form.cuotaId === c.cuota.id}
              onCambiar$={() => {
                form.cuotaId = c.cuota.id;
                form.monto = String(c.resta);
              }}
            >
              Cuota {c.orden} · {pesos(c.resta)}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
});
