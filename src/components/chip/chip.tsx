import { component$, Slot, type QRL } from "@builder.io/qwik";
import { cn } from "@qwik-ui/utils";
import { Button } from "~/components/ui";

type ChipProps = {
  activo: boolean;
  redondo?: boolean;
  class?: string;
  onCambiar$: QRL<() => void>;
};

/** Something to mark on or off, with a small box that fills in. */
export const Chip = component$<ChipProps>((props) => {
  return (
    <Button
      look="outline"
      aria-pressed={props.activo}
      class={cn(
        "aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:hover:bg-foreground h-auto min-h-11 justify-start gap-2.5 py-1 pr-4 pl-3 text-left font-sans text-base font-normal whitespace-normal shadow-xs",
        "before:size-3.5 before:shrink-0 before:border-2 before:border-current before:content-[''] aria-pressed:before:bg-current",
        props.redondo ? "before:rounded-full" : "before:rounded-xs",
        props.class,
      )}
      onClick$={props.onCambiar$}
    >
      <Slot />
    </Button>
  );
});
