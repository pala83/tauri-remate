import { component$ } from "@builder.io/qwik";
import { Atajos } from "~/components/atajos/atajos";
import { pesos } from "~/lib/textos";
import type { MartilloState } from "./use-martillo";

const ATAJOS = [
  { teclas: ["Enter"], texto: "adjudica" },
  { teclas: ["Ctrl 1-5"], texto: "comprador reciente" },
  { teclas: ["Ctrl P"], texto: "pasa al próximo sin vender" },
  { teclas: ["Ctrl J"], texto: "suma el siguiente al conjunto" },
  { teclas: ["Esc"], texto: "cierra el buscador" },
];

const FILA = "flex justify-between gap-3";
const TENUE = "text-muted-foreground";

export const MartilloResumen = component$<{ m: MartilloState }>(({ m }) => {
  return (
    <div class="font-mono text-sm">
      <section class="mt-9">
        <h2 class="mb-3 font-bold">Marcha del remate</h2>
        <dl class="flex flex-col gap-2">
          <div class={FILA}>
            <dt class={TENUE}>Vendidos</dt>
            <dd class="font-bold">{m.marcha.value?.vendidos ?? 0}</dd>
          </div>
          <div class={FILA}>
            <dt class={TENUE}>Sin vender</dt>
            <dd class="font-bold">{m.marcha.value?.sinVender ?? 0}</dd>
          </div>
          <div class={FILA}>
            <dt class={TENUE}>Martillado</dt>
            <dd class="text-right font-bold whitespace-nowrap">
              {pesos(m.marcha.value?.martillado ?? 0)}
            </dd>
          </div>
          <div class={FILA}>
            <dt class={TENUE}>Comisión de la casa</dt>
            <dd class="text-sidebar-primary text-right font-bold whitespace-nowrap">
              {pesos(m.marcha.value?.comision ?? 0)}
            </dd>
          </div>
          <div class={FILA}>
            <dt class={TENUE}>Último adjudicado</dt>
            <dd class="text-right font-bold whitespace-nowrap">
              {m.ultimo.value ?? "—"}
            </dd>
          </div>
        </dl>
      </section>
      <Atajos items={ATAJOS} />
    </div>
  );
});
