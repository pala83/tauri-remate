import { component$, Slot } from "@builder.io/qwik";
import { cn } from "@qwik-ui/utils";
import { Badge } from "~/components/ui";

const COLORES = {
  azul: "text-sidebar-accent",
  acento: "text-sidebar-primary",
  rojo: "text-alert border-4 border-double px-1.5 py-px",
  tenue: "text-muted-foreground",
};

type SelloProps = { color: keyof typeof COLORES; mini?: boolean };

/** A rubber stamp: no fill, the border takes the color of the text. */
export const Sello = component$<SelloProps>(({ color, mini }) => {
  return (
    <Badge
      look="outline"
      class={cn(
        "-rotate-2 rounded-sm border-current bg-transparent px-2 py-0.5 font-mono text-xs font-bold tracking-wider whitespace-nowrap uppercase shadow-none",
        COLORES[color],
        mini && "rotate-0 px-1.5 py-0 align-middle",
      )}
    >
      <Slot />
    </Badge>
  );
});
