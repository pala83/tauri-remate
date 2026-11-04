import { component$ } from "@builder.io/qwik";
import { Sello } from "~/components/sello/sello";

type RolBadgesProps = { aporta: number; compro: number };

/** A client's roles come from their lotes, they aren't stored. */
export const RolBadges = component$<RolBadgesProps>(({ aporta, compro }) => {
  return (
    <span class="flex flex-wrap gap-2">
      {aporta > 0 && <Sello color="acento">Vende</Sello>}
      {compro > 0 && <Sello color="azul">Compra</Sello>}
      {aporta === 0 && compro === 0 && (
        <Sello color="tenue">Sin operaciones</Sello>
      )}
    </span>
  );
});
