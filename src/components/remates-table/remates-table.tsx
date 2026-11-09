import { component$ } from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import { DataTable } from "~/components/data-table/data-table";
import { RemateRow } from "./remate-row";

const COLUMNAS = ["Nombre", "Fecha", "Lotes", " "];

export const RematesTable = component$(() => {
  const { state } = useAppState();

  return (
    <DataTable columns={COLUMNAS}>
      {state.remates.map((remate) => (
        <RemateRow key={remate.id} remate={remate} />
      ))}
      {state.cargado && state.remates.length === 0 && (
        <p
          q:slot="empty"
          class="text-muted-foreground p-6 text-lg italic md:px-8"
        >
          Todavía no hay remates.
        </p>
      )}
    </DataTable>
  );
});
