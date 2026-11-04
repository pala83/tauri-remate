import { component$ } from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import { NavItem } from "~/components/page-columns/nav-item";
import type { RemateResumen } from "~/db/remates";
import { fechaCorta } from "~/lib/fechas";
import { lotesTxt } from "~/lib/textos";

export const RemateNavItem = component$<{ remate: RemateResumen }>(
  ({ remate }) => {
    const { state, elegir$ } = useAppState();

    return (
      <NavItem
        current={remate.id === state.activoId}
        onClick$={() => elegir$(remate.id)}
      >
        <span class="flex min-w-0 flex-col gap-0.5">
          <span class="whitespace-normal">{remate.nombre}</span>
          <span class="text-muted-foreground font-mono text-xs font-normal">
            {fechaCorta(remate.fecha)} · {lotesTxt(remate.lotes)}
          </span>
        </span>
      </NavItem>
    );
  },
);
