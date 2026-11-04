import { component$ } from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import { DataRow } from "~/components/data-table/data-row";
import { LugarLink } from "~/components/lugar-link/lugar-link";
import { Sello } from "~/components/sello/sello";
import { Button } from "~/components/ui";
import type { RemateResumen } from "~/db/remates";
import { estadoCorto, fechaCorta } from "~/lib/fechas";

export const RemateRow = component$<{ remate: RemateResumen }>(({ remate }) => {
  const { state, elegir$ } = useAppState();
  const activa = remate.id === state.activoId;

  return (
    <DataRow selected={activa}>
      <td class="text-lg">
        <span class="flex items-center gap-2">
          {remate.nombre}
          {remate.lugar && <LugarLink url={remate.lugar} />}
        </span>
      </td>
      <td class="font-mono text-sm whitespace-nowrap">
        {fechaCorta(remate.fecha)}
      </td>
      <td class="font-mono text-sm">{remate.lotes}</td>
      <td class="text-muted-foreground font-mono text-sm">
        {estadoCorto(remate.fecha)}
      </td>
      <td class="text-right">
        {activa ? (
          <Sello color="azul">Activa</Sello>
        ) : (
          <Button
            look="outline"
            size="sm"
            class="font-normal shadow-xs"
            onClick$={() => elegir$(remate.id)}
          >
            Seleccionar
          </Button>
        )}
      </td>
    </DataRow>
  );
});
