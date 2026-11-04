import { component$, type QRL } from "@builder.io/qwik";
import { DataRow } from "~/components/data-table/data-row";
import { RolBadges } from "~/components/rol-badges/rol-badges";
import { Button } from "~/components/ui";
import type { ClienteResumen } from "~/db/clientes";
import { irA } from "~/lib/scroll";
import { lotesTxt, titulo } from "~/lib/textos";

type ClienteRowProps = {
  cliente: ClienteResumen;
  selected: boolean;
  onElegir$: QRL<(id: number) => void>;
};

export const ClienteRow = component$<ClienteRowProps>(
  ({ cliente, selected, onElegir$ }) => {
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
        <td class="font-mono text-sm">
          {cliente.aporta ? lotesTxt(cliente.aporta) : "—"}
        </td>
        <td class="font-mono text-sm">
          {cliente.compro ? lotesTxt(cliente.compro) : "—"}
        </td>
      </DataRow>
    );
  },
);
