import { component$, type PropsOf, Slot } from "@builder.io/qwik";
import { cn } from "@qwik-ui/utils";
import { Button } from "~/components/ui";

type NavItemProps = PropsOf<typeof Button> & { current?: boolean };

export const NavItem = component$<NavItemProps>(({ current, ...props }) => {
  return (
    <Button
      {...props}
      look="ghost"
      aria-current={current ? "true" : undefined}
      class={cn(
        "aria-current:bg-muted h-auto min-h-11 w-full justify-start gap-2.5 px-3 py-2 text-left font-sans text-base font-normal aria-current:font-bold",
        props.class,
      )}
    >
      <Slot />
    </Button>
  );
});
