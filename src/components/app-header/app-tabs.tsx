import { cn } from "@qwik-ui/utils";
import { component$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { buttonVariants } from "~/components/ui";

const TABS = [
  { href: "/", label: "Remates" },
  { href: "/lotes/", label: "Lotes" },
  { href: "/clientes/", label: "Clientes" },
];

export const AppTabs = component$(() => {
  const { url } = useLocation();
  // Editing a remate belongs to the Remates section.
  const actual = () => (url.pathname === "/remate/" ? "/" : url.pathname);

  return (
    <nav aria-label="Apartados" class="ml-auto flex items-center gap-5">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={actual() === tab.href ? "page" : undefined}
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
