import { component$, Slot } from "@builder.io/qwik";
import { cn } from "@qwik-ui/utils";

export const DataRow = component$<{ selected?: boolean }>(({ selected }) => {
  return (
    <tr
      class={cn(
        "border-sidebar-border hover:bg-muted border-b-1 transition-colors [&>td]:px-6 [&>td]:py-3.5",
        selected && "bg-accent",
      )}
    >
      <Slot />
    </tr>
  );
});
