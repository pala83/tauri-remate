import { component$, useSignal } from "@builder.io/qwik";
import { cn } from "@qwik-ui/utils";

type TocProps = {
  items: { id: string; label: string; sub?: boolean; foco?: string }[];
};

export const PageToc = component$<TocProps>(({ items }) => {
  const actual = useSignal(items[0]?.id);

  return (
    <nav aria-label="En esta página" class="font-mono text-sm">
      <p class="mb-3 font-bold">En esta página</p>
      <ul class="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={actual.value === item.id ? "true" : undefined}
              onClick$={() => {
                actual.value = item.id;
                if (item.foco) document.getElementById(item.foco)?.focus();
              }}
              class={cn(
                "text-muted-foreground hover:text-foreground aria-current:text-foreground block py-1 hover:underline aria-current:font-bold",
                item.sub && "pl-4.5",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
});
