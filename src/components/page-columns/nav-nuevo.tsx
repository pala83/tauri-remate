import { component$, Slot, type QRL } from "@builder.io/qwik";
import { LuPlus } from "@qwikest/icons/lucide";
import { NavItem } from "./nav-item";

/** The nav's last entry, which goes to the form for a new one. */
export const NavNuevo = component$<{ onClick$: QRL<() => void> }>(
  ({ onClick$ }) => {
    return (
      <NavItem class="text-sidebar-primary" onClick$={onClick$}>
        <LuPlus class="size-4 shrink-0" />
        <Slot />
      </NavItem>
    );
  },
);
