import { component$ } from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import { DataRow } from "~/components/data-table/data-row";
import { LugarLink } from "~/components/lugar-link/lugar-link";
import { Sello } from "~/components/sello/sello";
import { Button } from "~/components/ui";
import type { RemateResumen } from "~/db/remates";
import { fechaCorta } from "~/lib/fechas";

export const RemateRow = component$<{ remate: RemateResumen }>(({ remate }) => {
  const { state, elegir$ } = useAppState();
  const activa = remate.id === state.activoId;

  return (
    <DataRow selected={activa}>
      <td class="max-w-50 text-lg flex items-center justify-between gap-2">
          <p class=" truncate">
            {remate.nombre}
          </p>
          {remate.lugar && <LugarLink url={remate.lugar} />}
      </td>
      <td class="font-mono text-sm whitespace-nowrap">
        {fechaCorta(remate.fecha)}
      </td>
      <td class="font-mono text-sm">{remate.lotes}</td>
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
