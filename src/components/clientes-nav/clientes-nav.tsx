import { component$, type QRL } from "@builder.io/qwik";
import { LuPlus } from "@qwikest/icons/lucide";
import { NavItem } from "~/components/page-columns/nav-item";
import { NavSection } from "~/components/page-columns/nav-section";
import type { ClienteResumen } from "~/db/clientes";
import { irA } from "~/lib/scroll";
import { titulo } from "~/lib/textos";

type ClientesNavProps = {
  titulo: string;
  clientes: ClienteResumen[];
  seleccionado: number | null;
  onElegir$: QRL<(id: number) => void>;
  onNuevo$: QRL<() => void>;
};

export const ClientesNav = component$<ClientesNavProps>((props) => {
  return (
    <NavSection title={props.titulo}>
      {props.clientes.map((cliente) => (
        <NavItem
          key={cliente.id}
          current={cliente.id === props.seleccionado}
          onClick$={async () => {
            await props.onElegir$(cliente.id);
            irA("ficha-cliente");
          }}
        >
          <span class="min-w-0 flex-1 truncate">{titulo(cliente.nombre)}</span>
          <span class="text-muted-foreground shrink-0 font-mono text-xs font-normal">
            {[cliente.aporta > 0 && "vende", cliente.compro > 0 && "compra"]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </NavItem>
      ))}
      <NavItem
        class="text-sidebar-primary"
        onClick$={async () => {
          await props.onNuevo$();
          irA("nuevo-cliente", "cliente-nombre");
        }}
      >
        <LuPlus class="size-4 shrink-0" />
        Nuevo cliente
      </NavItem>
    </NavSection>
  );
});
