import { component$, useComputed$ } from "@builder.io/qwik";
import { LuGavel, LuRotateCcw } from "@qwikest/icons/lucide";
import { NavItem } from "~/components/page-columns/nav-item";
import { NavSection } from "~/components/page-columns/nav-section";
import { bloquesVendidos } from "~/lib/martillo";
import type { MartilloState } from "./use-martillo";

export const MartilloNav = component$<{ m: MartilloState; titulo: string }>(
  ({ m, titulo }) => {
    const bloques = useComputed$(() => bloquesVendidos(m.lotes.value));
    const visible = useComputed$(
      () => m.filas.value[m.virtual.inicio.value]?.numero ?? 0,
    );

    return (
      <NavSection title={titulo}>
        <NavItem onClick$={() => document.getElementById("r-precio")?.focus()}>
          <LuGavel class="text-sidebar-primary size-4 shrink-0" />
          <span class="flex-1">En el martillo</span>
          <span class="text-muted-foreground font-mono text-xs font-normal">
            {m.numero.value === null ? "—" : `N° ${m.numero.value}`}
          </span>
        </NavItem>
        <NavItem
          current={m.filtro.value === "sin-vender"}
          onClick$={() => {
            m.filtro.value = "sin-vender";
          }}
        >
          <LuRotateCcw class="text-sidebar-primary size-4 shrink-0" />
          <span class="flex-1">Ver sin vender</span>
          <span class="text-muted-foreground font-mono text-xs font-normal">
            {m.marcha.value?.sinVender ?? 0}
          </span>
        </NavItem>
        <h3 class="text-muted-foreground mx-3 mt-5 mb-1.5 font-mono text-xs tracking-wider uppercase">
          Saltar a · vendidos
        </h3>
        {bloques.value.map(({ desde, hasta, rango, cuenta }) => (
          <NavItem
            key={desde}
            current={visible.value >= desde && visible.value <= hasta}
            onClick$={() => {
              const fila = m.filas.value.findIndex((l) => l.numero >= desde);
              if (fila !== -1) m.virtual.destino.value = { fila };
            }}
          >
            <span class="flex-1 font-mono text-sm">{rango}</span>
            <span class="text-muted-foreground font-mono text-xs font-normal">
              {cuenta}
            </span>
          </NavItem>
        ))}
      </NavSection>
    );
  },
);
