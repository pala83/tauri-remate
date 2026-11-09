import { component$ } from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import { NavNuevo } from "~/components/page-columns/nav-nuevo";
import { NavSection } from "~/components/page-columns/nav-section";
import { esRealizada } from "~/lib/fechas";
import { irA } from "~/lib/scroll";
import { RemateNavItem } from "./remate-nav-item";

export const RematesNav = component$(() => {
  const { state } = useAppState();
  const realizadas = state.remates.filter((r) => esRealizada(r.fecha));
  const proximas = state.remates.filter((r) => !esRealizada(r.fecha)).reverse();

  return (
    <div class="flex flex-col gap-8">
      <NavSection title="Próximas">
        {proximas.map((remate) => (
          <RemateNavItem key={remate.id} remate={remate} />
        ))}
        <NavNuevo onClick$={() => irA("nuevo-remate", "remate-nombre")}>
          Nuevo remate
        </NavNuevo>
      </NavSection>
      {realizadas.length > 0 && (
        <NavSection title="Realizadas">
          {realizadas.map((remate) => (
            <RemateNavItem key={remate.id} remate={remate} />
          ))}
        </NavSection>
      )}
    </div>
  );
});
