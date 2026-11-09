import { cn } from "@qwik-ui/utils";
import { component$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { buttonVariants } from "~/components/ui";

const TABS = [
  { href: "/lotes/", label: "Lotes" },
  { href: "/clientes/", label: "Clientes" },
  { href: "/martillo/", label: "Remate" },
];

export const AppTabs = component$(() => {
  const { url } = useLocation();

  return (
    <nav aria-label="Apartados" class="ml-auto flex items-center gap-5">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={url.pathname === tab.href ? "page" : "false"}
          class={cn(
            buttonVariants({ look: "ghost" }),
            "text-muted-foreground hover:text-foreground aria-[current=page]:border-foreground aria-[current=page]:text-foreground rounded-none border-b-3 border-transparent px-0.5 font-normal hover:bg-transparent aria-[current=page]:font-bold",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
});
