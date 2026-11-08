import { component$, type QRL } from "@builder.io/qwik";
import { DataRow } from "~/components/data-table/data-row";
import { RolBadges } from "~/components/rol-badges/rol-badges";
import { Button } from "~/components/ui";
import type { ClienteResumen } from "~/db/clientes";
import { irA } from "~/lib/scroll";
import { pesos, titulo } from "~/lib/textos";
import { claseSaldo, saldoCorto } from "~/components/liquidacion/saldo";

export type SaldoCliente = {
  tCompras: number;
  tVentas: number;
  saldo: number;
  hayMovimientos: boolean;
};

const monto = (n?: number) => (n ? pesos(n) : "—");

type ClienteRowProps = {
  cliente: ClienteResumen;
  selected: boolean;
  saldo?: SaldoCliente;
  onElegir$: QRL<(id: number) => void>;
};

export const ClienteRow = component$<ClienteRowProps>(
  ({ cliente, selected, saldo, onElegir$ }) => {
    return (
      <DataRow selected={selected}>
        <td>
          <Button
            look="link"
            class="h-auto p-0 text-left font-sans text-lg font-normal whitespace-normal"
            onClick$={async () => {
              await onElegir$(cliente.id);
              irA("ficha-cliente");
            }}
          >
            {titulo(cliente.nombre)}
          </Button>
        </td>
        <td>
          <RolBadges aporta={cliente.aporta} compro={cliente.compro} />
        </td>
        <td class="font-mono text-sm">{monto(saldo?.tCompras)}</td>
        <td class="font-mono text-sm">{monto(saldo?.tVentas)}</td>
        <td
          class={`font-mono text-sm font-bold ${claseSaldo(saldo?.saldo ?? 0)}`}
        >
          {saldoCorto(saldo?.saldo ?? 0, saldo?.hayMovimientos ?? false)}
        </td>
      </DataRow>
    );
  },
);
