import { component$ } from "@builder.io/qwik";
import { cn } from "@qwik-ui/utils";

export const RemateStat = component$<{
  label: string;
  value: number;
  acento?: boolean;
}>(({ label, value, acento }) => {
  return (
    <div class="border-sidebar-border px-6 py-4 not-last:border-r-1 md:px-8">
      <dt class="text-muted-foreground font-mono text-xs tracking-wider uppercase">
        {label}
      </dt>
      <dd
        class={cn(
          "mt-0.5 font-serif text-4xl",
          acento && "text-sidebar-primary",
        )}
      >
        {value}
      </dd>
    </div>
  );
});
