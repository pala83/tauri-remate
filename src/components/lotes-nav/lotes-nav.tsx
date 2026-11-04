import { component$, type QRL } from "@builder.io/qwik";
import { LuPlus } from "@qwikest/icons/lucide";
import { NavItem } from "~/components/page-columns/nav-item";
import { NavSection } from "~/components/page-columns/nav-section";
import type { bloquesDe } from "~/lib/lotes";

type LotesNavProps = {
  titulo: string;
  proximo: number;
  bloques: ReturnType<typeof bloquesDe>;
  /** The number of the first lot in view. */
  visible: number;
  onCargar$: QRL<() => void>;
  onSaltar$: QRL<(desde: number) => void>;
};

export const LotesNav = component$<LotesNavProps>((props) => {
  return (
    <NavSection title={props.titulo}>
      <NavItem onClick$={props.onCargar$}>
        <LuPlus class="text-sidebar-primary size-4 shrink-0" />
        <span class="flex-1">Cargar lote</span>
        <span class="text-muted-foreground font-mono text-xs font-normal">
          N° {props.proximo}
        </span>
      </NavItem>
      <h3 class="text-muted-foreground mx-3 mt-5 mb-1.5 font-mono text-xs tracking-wider uppercase">
        Saltar a
      </h3>
      {props.bloques.map(({ desde, hasta, rango, cuenta }) => (
        <NavItem
          key={desde}
          current={props.visible >= desde && props.visible <= hasta}
          onClick$={() => props.onSaltar$(desde)}
        >
          <span class="flex-1 font-mono text-sm">{rango}</span>
          <span class="text-muted-foreground font-mono text-xs font-normal">
            {cuenta}
          </span>
        </NavItem>
      ))}
      {props.bloques.length === 0 && (
        <p class="text-muted-foreground mx-3 mt-1 italic">
          Todavía no hay lotes cargados.
        </p>
      )}
    </NavSection>
  );
});
