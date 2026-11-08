import { component$, type QRL } from "@builder.io/qwik";
import { DataTable } from "~/components/data-table/data-table";
import type { ClienteResumen } from "~/db/clientes";
import { ClienteRow, type SaldoCliente } from "./cliente-row";

const COLUMNAS = ["Cliente", "Rol", "Compras", "Ventas", "Saldo"];

type ClientesTableProps = {
  clientes: ClienteResumen[];
  cargado: boolean;
  seleccionado: number | null;
  saldos: Record<number, SaldoCliente>;
  onElegir$: QRL<(id: number) => void>;
};

export const ClientesTable = component$<ClientesTableProps>((props) => {
  return (
    <DataTable columns={COLUMNAS}>
      {props.clientes.map((cliente) => (
        <ClienteRow
          key={cliente.id}
          cliente={cliente}
          selected={cliente.id === props.seleccionado}
          saldo={props.saldos[cliente.id] as SaldoCliente | undefined}
          onElegir$={props.onElegir$}
        />
      ))}
      {props.cargado && props.clientes.length === 0 && (
        <p
          q:slot="empty"
          class="text-muted-foreground p-6 text-lg italic md:px-8"
        >
          Todavía no hay clientes en este filtro.
        </p>
      )}
    </DataTable>
  );
});
