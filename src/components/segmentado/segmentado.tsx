import { component$, type QRL } from "@builder.io/qwik";
import { Button } from "~/components/ui";

type SegmentadoProps = {
  opciones: { valor: string; texto: string; cuenta?: number }[];
  valor: string;
  etiqueta: string;
  onElegir$: QRL<(valor: string) => void>;
};

/** One option out of a few, like the sheet's filters. */
export const Segmentado = component$<SegmentadoProps>((props) => {
  return (
    <div
      role="group"
      aria-label={props.etiqueta}
      class="bg-popover flex w-fit flex-wrap overflow-hidden rounded-sm border shadow-xs"
    >
      {props.opciones.map(({ valor, texto, cuenta }) => (
        <Button
          key={valor}
          look="ghost"
          aria-pressed={props.valor === valor}
          class="not-last:border-input hover:bg-muted aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:hover:bg-foreground h-11 gap-2 rounded-none border-0 px-4 font-mono text-sm font-normal not-last:border-r aria-pressed:font-bold"
          onClick$={() => props.onElegir$(valor)}
        >
          {texto}
          {cuenta !== undefined && <span>{cuenta}</span>}
        </Button>
      ))}
    </div>
  );
});
