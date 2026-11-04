import { component$ } from "@builder.io/qwik";
import { cn } from "@qwik-ui/utils";
import { numeroLote } from "~/lib/textos";

export const DottedRow = component$<{
  numero?: number;
  label: string;
  value: string;
  tenue?: boolean;
}>(({ numero, label, value, tenue }) => {
  return (
    <div class="flex items-baseline gap-2">
      <dt
        class={cn(
          "min-w-0 truncate",
          numero === undefined && "text-sidebar-accent-foreground",
        )}
      >
        {numero !== undefined && (
          <span class="text-sidebar-primary-foreground mr-2 font-bold">
            N° {numeroLote(numero)}
          </span>
        )}
        {label}
      </dt>
      <span
        aria-hidden="true"
        class="border-sidebar-accent-foreground min-w-6 flex-1 -translate-y-1 border-b-2 border-dotted opacity-50"
      />
      <dd
        class={
          tenue
            ? "text-sidebar-accent-foreground shrink-0"
            : "shrink-0 text-right"
        }
      >
        {value}
      </dd>
    </div>
  );
});
