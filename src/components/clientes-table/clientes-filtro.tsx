import { component$, type Signal } from "@builder.io/qwik";
import { Segmentado } from "~/components/segmentado/segmentado";
import type { ClienteResumen } from "~/db/clientes";

export type FiltroClientes = "todos" | "vende" | "compra" | "con-saldo";

const OPCIONES: { valor: FiltroClientes; texto: string }[] = [
  { valor: "todos", texto: "Todos" },
  { valor: "vende", texto: "Venden" },
  { valor: "compra", texto: "Compran" },
  { valor: "con-saldo", texto: "Con saldo" },
];

/** "venden", as the list's title says it. */
export const etiquetaFiltro = (filtro: FiltroClientes) =>
  OPCIONES.find((o) => o.valor === filtro)!.texto.toLowerCase();

/** The clients each filter shows. */
export const listasClientes = (
  clientes: ClienteResumen[],
  saldos: Record<number, { saldo: number } | undefined>,
): Record<FiltroClientes, ClienteResumen[]> => ({
  todos: clientes,
  vende: clientes.filter((c) => c.aporta > 0),
  compra: clientes.filter((c) => c.compro > 0),
  "con-saldo": clientes.filter((c) => saldos[c.id]?.saldo),
});

type FiltroProps = {
  filtro: Signal<FiltroClientes>;
  listas: Record<FiltroClientes, ClienteResumen[]>;
};

export const ClientesFiltro = component$<FiltroProps>(({ filtro, listas }) => {
  return (
    <div class="mb-5">
      <Segmentado
        etiqueta="Filtrar clientes"
        valor={filtro.value}
        opciones={OPCIONES.map((o) => ({
          ...o,
          cuenta: listas[o.valor].length,
        }))}
        onElegir$={(valor) => {
          // Pressing the active option goes back to all of them.
          filtro.value =
            valor === filtro.value ? "todos" : (valor as FiltroClientes);
        }}
      />
    </div>
  );
});
