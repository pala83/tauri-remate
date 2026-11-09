import { component$, type QRL } from "@builder.io/qwik";
import { cn } from "@qwik-ui/utils";
import { Button } from "~/components/ui";
import { GRUPO, OPCION } from "./clases";

type SegmentadoProps = {
  opciones: { valor: string; texto: string; cuenta?: number }[];
  valor: string;
  etiqueta: string;
  onElegir$: QRL<(valor: string) => void>;
};

/** One option out of a few, like the sheet's filters. */
export const Segmentado = component$<SegmentadoProps>((props) => {
  return (
    <div role="group" aria-label={props.etiqueta} class={GRUPO}>
      {props.opciones.map(({ valor, texto, cuenta }) => (
        <Button
          key={valor}
          look="ghost"
          aria-pressed={props.valor === valor}
          class={cn(
            OPCION,
            "aria-pressed:bg-foreground aria-pressed:text-background px-4 text-sm font-normal aria-pressed:font-bold",
          )}
          onClick$={() => props.onElegir$(valor)}
        >
          {texto}
          {cuenta !== undefined && <span>{cuenta}</span>}
        </Button>
      ))}
    </div>
  );
});
