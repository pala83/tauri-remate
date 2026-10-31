import {
  $,
  component$,
  isBrowser,
  type PropsOf,
  type Signal,
  Slot,
  useContextProvider,
  useOnWindow,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Link, useNavigate } from "@builder.io/qwik-city";
import { LuPanelLeft } from "@qwikest/icons/lucide";
import { cn } from "@qwik-ui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "../button/button";
import { Input as UiInput } from "../input/input";
import { Modal } from "../modal/modal";
import { Separator as UiSeparator } from "../separator/separator";
import { Skeleton } from "../skeleton/skeleton";
import { Tooltip } from "../tooltip/tooltip";
import {
  sidebarContextId,
  type SidebarSide,
  useSidebar,
} from "./sidebar-context";

export { useSidebar } from "./sidebar-context";

const STORAGE_KEY = "sidebar_state";
const KEYBOARD_SHORTCUT = "b";

// All sizes and colors come from the `--sidebar-*` tokens in src/global.css.

type ProviderProps = PropsOf<"div"> & {
  defaultOpen?: boolean;
  "bind:open"?: Signal<boolean>;
};

const Provider = component$<ProviderProps>(
  ({ defaultOpen = true, "bind:open": givenOpen, ...props }) => {
    const internalOpen = useSignal(defaultOpen);
    const open = givenOpen ?? internalOpen;
    const openMobile = useSignal(false);
    const isMobile = useSignal(false);
    const side = useSignal<SidebarSide>("left");

    const toggle$ = $(() => {
      if (isMobile.value) {
        openMobile.value = !openMobile.value;
      } else {
        open.value = !open.value;
      }
    });

    useContextProvider(sidebarContextId, {
      open,
      openMobile,
      isMobile,
      side,
      toggle$,
    });

    // Restore the persisted state and follow the mobile breakpoint, which is
    // read from `--sidebar-mobile-breakpoint` so it lives with the other tokens.
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ cleanup }) => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) open.value = saved === "true";
      } catch {
        // Storage unavailable: keep the default state.
      }

      const breakpoint = getComputedStyle(document.documentElement)
        .getPropertyValue("--sidebar-mobile-breakpoint")
        .trim();
      const query = matchMedia(`(width < ${breakpoint})`);
      const update = () => (isMobile.value = query.matches);
      update();
      query.addEventListener("change", update);
      cleanup(() => query.removeEventListener("change", update));
    });

    useTask$(({ track }) => {
      const value = track(open);
      if (!isBrowser) return;
      try {
        localStorage.setItem(STORAGE_KEY, String(value));
      } catch {
        // Storage unavailable: the state just won't persist.
      }
    });

    // Ctrl/Cmd+B. The webview has no default action for it, so no preventDefault.
    useOnWindow(
      "keydown",
      $((event: KeyboardEvent) => {
        if (
          event.key.toLowerCase() === KEYBOARD_SHORTCUT &&
          (event.ctrlKey || event.metaKey)
        ) {
          toggle$();
        }
      }),
    );

    return (
      <div
        {...props}
        data-sidebar="wrapper"
        class={cn(
          "group/sidebar-wrapper has-data-[look=inset]:bg-sidebar flex min-h-svh w-full",
          props.class,
        )}
      >
        <Slot />
      </div>
    );
  },
);

type RootProps = PropsOf<"div"> & {
  side?: SidebarSide;
  look?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
};

const Root = component$<RootProps>(
  ({
    side = "left",
    look = "sidebar",
    collapsible = "offcanvas",
    ...props
  }) => {
    const sidebar = useSidebar();

    useTask$(({ track }) => {
      sidebar.side.value = track(() => side);
    });

    if (collapsible === "none") {
      return (
        <div
          {...props}
          data-sidebar="sidebar"
          class={cn(
            "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
            props.class,
          )}
        >
          <Slot />
        </div>
      );
    }

    if (sidebar.isMobile.value) {
      return (
        <Modal.Root bind:show={sidebar.openMobile}>
          <Modal.Panel
            position={side}
            data-sidebar="sidebar"
            data-mobile="true"
            class={cn(
              "bg-sidebar text-sidebar-foreground w-(--sidebar-width-mobile) max-w-none p-0",
              props.class,
            )}
          >
            <Modal.Title class="sr-only">Sidebar</Modal.Title>
            <div class="flex size-full flex-col">
              <Slot />
            </div>
          </Modal.Panel>
        </Modal.Root>
      );
    }

    const collapsed = !sidebar.open.value;

    return (
      <div
        class="group/sidebar peer/sidebar text-sidebar-foreground"
        data-state={collapsed ? "collapsed" : "expanded"}
        data-collapsible={collapsed ? collapsible : ""}
        data-look={look}
        data-side={side}
      >
        {/* Reserves the sidebar's width in the page flow. */}
        <div
          class={cn(
            "relative w-(--sidebar-width) bg-transparent transition-[width] duration-(--sidebar-duration) ease-linear",
            "group-data-[collapsible=offcanvas]/sidebar:w-0",
            look === "sidebar"
              ? "group-data-[collapsible=icon]/sidebar:w-(--sidebar-width-icon)"
              : "group-data-[collapsible=icon]/sidebar:w-(--sidebar-width-icon-floating)",
          )}
        />
        <div
          {...props}
          class={cn(
            "fixed inset-y-0 z-10 flex h-svh w-(--sidebar-width) transition-[left,right,width] duration-(--sidebar-duration) ease-linear",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]/sidebar:-left-(--sidebar-width)"
              : "right-0 group-data-[collapsible=offcanvas]/sidebar:-right-(--sidebar-width)",
            look === "sidebar"
              ? cn(
                  "border-sidebar-border group-data-[collapsible=icon]/sidebar:w-(--sidebar-width-icon)",
                  side === "left" ? "border-r" : "border-l",
                )
              : "p-(--sidebar-padding) group-data-[collapsible=icon]/sidebar:w-(--sidebar-width-icon-floating)",
            props.class,
          )}
        >
          <div
            data-sidebar="sidebar"
            class={cn(
              "bg-sidebar flex size-full flex-col",
              look === "floating" &&
                "border-sidebar-border rounded-base border shadow-md",
            )}
          >
            <Slot />
          </div>
        </div>
      </div>
    );
  },
);

const Trigger = component$<PropsOf<typeof Button>>(({ onClick$, ...props }) => {
  const sidebar = useSidebar();
  return (
    <Button
      look="ghost"
      size="icon"
      {...props}
      data-sidebar="trigger"
      onClick$={[onClick$, $(() => sidebar.toggle$())]}
    >
      <LuPanelLeft class="size-(--sidebar-icon-size)" />
      <span class="sr-only">Toggle Sidebar</span>
    </Button>
  );
});

const Rail = component$<PropsOf<"button">>(({ onClick$, ...props }) => {
  const sidebar = useSidebar();
  const collapsed = !sidebar.open.value;
  // Cursor points to where the edge will move.
  const towardsRight = (sidebar.side.value === "left") === collapsed;

  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label="Toggle Sidebar"
      title="Toggle Sidebar"
      {...props}
      data-sidebar="rail"
      onClick$={[onClick$, $(() => sidebar.toggle$())]}
      class={cn(
        "absolute inset-y-0 z-20 flex w-(--sidebar-padding) transition-all ease-linear",
        "hover:after:bg-sidebar-primary after:absolute after:inset-y-0 after:left-1/2 after:w-(--default-border-width) after:-translate-x-1/2",
        towardsRight ? "cursor-e-resize" : "cursor-w-resize",
        "group-data-[side=left]/sidebar:right-0 group-data-[side=left]/sidebar:translate-x-1/2",
        "group-data-[side=right]/sidebar:left-0 group-data-[side=right]/sidebar:-translate-x-1/2",
        "group-data-[collapsible=offcanvas]/sidebar:group-data-[side=left]/sidebar:translate-x-full",
        "group-data-[collapsible=offcanvas]/sidebar:group-data-[side=right]/sidebar:-translate-x-full",
        props.class,
      )}
    />
  );
});

const Inset = component$<PropsOf<"main">>((props) => {
  return (
    <main
      {...props}
      class={cn(
        "bg-background relative flex w-full min-w-0 flex-1 flex-col",
        "peer-data-[look=inset]/sidebar:rounded-base peer-data-[look=inset]/sidebar:m-(--sidebar-padding) peer-data-[look=inset]/sidebar:ml-0 peer-data-[look=inset]/sidebar:border peer-data-[look=inset]/sidebar:shadow-sm",
        "peer-data-[look=inset]/sidebar:peer-data-[state=collapsed]/sidebar:ml-(--sidebar-padding)",
        props.class,
      )}
    >
      <Slot />
    </main>
  );
});

const Input = component$<PropsOf<typeof UiInput>>((props) => {
  return (
    <UiInput
      {...props}
      data-sidebar="input"
      class={cn(
        "bg-background h-(--sidebar-item-height-sm) w-full shadow-none",
        props.class,
      )}
    />
  );
});

const Header = component$<PropsOf<"div">>((props) => {
  return (
    <div
      {...props}
      data-sidebar="header"
      class={cn(
        "flex flex-col gap-(--sidebar-gap) p-(--sidebar-padding)",
        props.class,
      )}
    >
      <Slot />
    </div>
  );
});

const Footer = component$<PropsOf<"div">>((props) => {
  return (
    <div
      {...props}
      data-sidebar="footer"
      class={cn(
        "flex flex-col gap-(--sidebar-gap) p-(--sidebar-padding)",
        props.class,
      )}
    >
      <Slot />
    </div>
  );
});

const Separator = component$<PropsOf<typeof UiSeparator>>((props) => {
  return (
    <UiSeparator
      {...props}
      data-sidebar="separator"
      class={cn(
        "bg-sidebar-border mx-(--sidebar-padding) h-(--border-width) w-auto",
        props.class,
      )}
    />
  );
});

const Content = component$<PropsOf<"div">>((props) => {
  return (
    <div
      {...props}
      data-sidebar="content"
      class={cn(
        "flex min-h-0 flex-1 flex-col gap-(--sidebar-gap) overflow-auto group-data-[collapsible=icon]/sidebar:overflow-hidden",
        props.class,
      )}
    >
      <Slot />
    </div>
  );
});

const Group = component$<PropsOf<"div">>((props) => {
  return (
    <div
      {...props}
      data-sidebar="group"
      class={cn(
        "relative flex w-full min-w-0 flex-col p-(--sidebar-padding)",
        props.class,
      )}
    >
      <Slot />
    </div>
  );
});

const GroupLabel = component$<PropsOf<"div">>((props) => {
  return (
    <div
      {...props}
      data-sidebar="group-label"
      class={cn(
        "rounded-base text-sidebar-foreground/70 ring-sidebar-ring flex h-(--sidebar-item-height-sm) shrink-0 items-center px-(--sidebar-padding) text-xs font-bold tracking-wide uppercase outline-hidden transition-[margin,opacity] duration-(--sidebar-duration) ease-linear focus-visible:ring-1 [&>svg]:size-(--sidebar-icon-size) [&>svg]:shrink-0",
        "group-data-[collapsible=icon]/sidebar:-mt-(--sidebar-item-height-sm) group-data-[collapsible=icon]/sidebar:opacity-0",
        props.class,
      )}
    >
      <Slot />
    </div>
  );
});

const GroupAction = component$<PropsOf<"button">>((props) => {
  return (
    <button
      type="button"
      {...props}
      data-sidebar="group-action"
      class={cn(
        "rounded-base text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-(--sidebar-padding) right-(--sidebar-padding) flex size-(--sidebar-item-height-sm) items-center justify-center outline-hidden focus-visible:ring-1 [&>svg]:size-(--sidebar-icon-size) [&>svg]:shrink-0",
        "group-data-[collapsible=icon]/sidebar:hidden",
        props.class,
      )}
    >
      <Slot />
    </button>
  );
});

const GroupContent = component$<PropsOf<"div">>((props) => {
  return (
    <div
      {...props}
      data-sidebar="group-content"
      class={cn("w-full text-sm", props.class)}
    >
      <Slot />
    </div>
  );
});

const Menu = component$<PropsOf<"ul">>((props) => {
  return (
    <ul
      {...props}
      data-sidebar="menu"
      class={cn(
        "flex w-full min-w-0 flex-col gap-(--sidebar-gap)",
        props.class,
      )}
    >
      <Slot />
    </ul>
  );
});

const MenuItem = component$<PropsOf<"li">>((props) => {
  return (
    <li
      {...props}
      data-sidebar="menu-item"
      class={cn("group/menu-item relative", props.class)}
    >
      <Slot />
    </li>
  );
});

export const sidebarMenuButtonVariants = cva(
  [
    "peer/menu-button rounded-base text-sidebar-foreground ring-sidebar-ring flex w-full items-center gap-(--sidebar-padding) overflow-hidden p-(--sidebar-padding) text-left outline-hidden transition-[width,height,padding] duration-(--sidebar-duration)",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&>span:last-child]:truncate [&>svg]:size-(--sidebar-icon-size) [&>svg]:shrink-0",
    "group-has-data-[sidebar=menu-action]/menu-item:pr-(--sidebar-item-height-md)",
    // Active item: same language as the primary Button (border, hard shadow, press).
    "data-[active=true]:border-base data-[active=true]:border-sidebar-border data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:hover:bg-sidebar-primary/90 data-[active=true]:hover:text-sidebar-primary-foreground data-[active=true]:font-bold data-[active=true]:shadow-xs data-[active=true]:active:press data-[active=true]:active:shadow-base",
    // Icon-only mode: square button, text hidden.
    "group-data-[collapsible=icon]/sidebar:size-(--sidebar-item-height-md)! group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:p-0! group-data-[collapsible=icon]/sidebar:[&>span]:hidden",
  ],
  {
    variants: {
      look: {
        default: "",
        outline: "bg-background border-sidebar-border border shadow-xs",
      },
      size: {
        sm: "h-(--sidebar-item-height-sm) text-xs",
        md: "h-(--sidebar-item-height-md) text-sm",
        lg: "h-(--sidebar-item-height-lg) text-sm",
      },
    },
    defaultVariants: {
      look: "default",
      size: "md",
    },
  },
);

type MenuButtonProps = PropsOf<"button"> &
  VariantProps<typeof sidebarMenuButtonVariants> & {
    isActive?: boolean;
    /** Shown next to the button when the sidebar is collapsed to icons. */
    tooltip?: string;
    /** Renders a Qwik City `<Link>` instead of a `<button>`. */
    href?: string;
  };

const MenuButton = component$<MenuButtonProps>(
  ({ isActive = false, look, size, tooltip, href, ...props }) => {
    const sidebar = useSidebar();
    const nav = useNavigate();

    const attrs = {
      "data-sidebar": "menu-button",
      "data-size": size ?? "md",
      "data-active": isActive ? "true" : undefined,
      class: cn(sidebarMenuButtonVariants({ look, size }), props.class),
    };

    // Tooltip.Trigger is itself a <button>, so a link can't live inside it;
    // in that case the trigger navigates programmatically.
    if (tooltip && !sidebar.open.value && !sidebar.isMobile.value) {
      return (
        <Tooltip.Root
          placement={sidebar.side.value === "left" ? "right" : "left"}
        >
          <Tooltip.Trigger
            {...(props as PropsOf<typeof Tooltip.Trigger>)}
            {...attrs}
            aria-current={href && isActive ? "page" : undefined}
            onClick$={[props.onClick$, href ? $(() => nav(href)) : undefined]}
          >
            <Slot />
          </Tooltip.Trigger>
          <Tooltip.Panel>{tooltip}</Tooltip.Panel>
        </Tooltip.Root>
      );
    }

    if (href) {
      return (
        <Link
          {...(props as PropsOf<"a">)}
          {...attrs}
          href={href}
          aria-current={isActive ? "page" : undefined}
        >
          <Slot />
        </Link>
      );
    }

    return (
      <button type="button" {...props} {...attrs}>
        <Slot />
      </button>
    );
  },
);

// Vertically centers absolutely positioned item decorations on the button row.
const menuDecorationTop =
  "top-[calc((var(--sidebar-item-height-md)-var(--sidebar-item-height-sm))/2)] peer-data-[size=sm]/menu-button:top-0 peer-data-[size=lg]/menu-button:top-[calc((var(--sidebar-item-height-lg)-var(--sidebar-item-height-sm))/2)]";

const MenuAction = component$<PropsOf<"button"> & { showOnHover?: boolean }>(
  ({ showOnHover = false, ...props }) => {
    return (
      <button
        type="button"
        {...props}
        data-sidebar="menu-action"
        class={cn(
          "rounded-base text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-primary-foreground absolute right-(--sidebar-padding) flex size-(--sidebar-item-height-sm) items-center justify-center outline-hidden focus-visible:ring-1 [&>svg]:size-(--sidebar-icon-size) [&>svg]:shrink-0",
          menuDecorationTop,
          "group-data-[collapsible=icon]/sidebar:hidden",
          showOnHover &&
            "opacity-0 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100",
          props.class,
        )}
      >
        <Slot />
      </button>
    );
  },
);

const MenuBadge = component$<PropsOf<"div">>((props) => {
  return (
    <div
      {...props}
      data-sidebar="menu-badge"
      class={cn(
        "text-sidebar-foreground peer-data-[active=true]/menu-button:text-sidebar-primary-foreground pointer-events-none absolute right-(--sidebar-padding) flex h-(--sidebar-item-height-sm) items-center text-xs font-bold tabular-nums select-none",
        menuDecorationTop,
        "group-data-[collapsible=icon]/sidebar:hidden",
        props.class,
      )}
    >
      <span class="border-sidebar-border bg-sidebar text-sidebar-foreground rounded-base border px-(--sidebar-gap) leading-none">
        <Slot />
      </span>
    </div>
  );
});

const MenuSkeleton = component$<PropsOf<"div"> & { showIcon?: boolean }>(
  ({ showIcon = false, ...props }) => {
    // Random text width between 50% and 90%, like shadcn's skeleton.
    const width = useSignal(`${Math.floor(Math.random() * 40) + 50}%`);
    return (
      <div
        {...props}
        data-sidebar="menu-skeleton"
        class={cn(
          "rounded-base flex h-(--sidebar-item-height-md) items-center gap-(--sidebar-padding) px-(--sidebar-padding)",
          props.class,
        )}
      >
        {showIcon && (
          <Skeleton
            data-sidebar="menu-skeleton-icon"
            class="rounded-base size-(--sidebar-icon-size)"
          />
        )}
        <Skeleton
          data-sidebar="menu-skeleton-text"
          class="h-(--sidebar-icon-size) max-w-(--skeleton-width) flex-1"
          style={{ "--skeleton-width": width.value }}
        />
      </div>
    );
  },
);

const MenuSub = component$<PropsOf<"ul">>((props) => {
  return (
    <ul
      {...props}
      data-sidebar="menu-sub"
      class={cn(
        "border-sidebar-border ml-(--sidebar-sub-indent) flex min-w-0 flex-col gap-(--sidebar-gap) border-l py-(--sidebar-gap) pl-(--sidebar-padding)",
        "group-data-[collapsible=icon]/sidebar:hidden",
        props.class,
      )}
    >
      <Slot />
    </ul>
  );
});

const MenuSubItem = component$<PropsOf<"li">>((props) => {
  return (
    <li
      {...props}
      data-sidebar="menu-sub-item"
      class={cn("group/menu-sub-item relative", props.class)}
    >
      <Slot />
    </li>
  );
});

export const sidebarMenuSubButtonVariants = cva(
  [
    "rounded-base text-sidebar-foreground ring-sidebar-ring flex h-(--sidebar-item-height-sm) min-w-0 items-center gap-(--sidebar-padding) overflow-hidden px-(--sidebar-padding) outline-hidden",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&>span:last-child]:truncate [&>svg]:size-(--sidebar-icon-size) [&>svg]:shrink-0",
    "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-bold",
    "group-data-[collapsible=icon]/sidebar:hidden",
  ],
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

type MenuSubButtonProps = PropsOf<"button"> &
  VariantProps<typeof sidebarMenuSubButtonVariants> & {
    isActive?: boolean;
    href?: string;
  };

const MenuSubButton = component$<MenuSubButtonProps>(
  ({ isActive = false, size, href, ...props }) => {
    const attrs = {
      "data-sidebar": "menu-sub-button",
      "data-size": size ?? "md",
      "data-active": isActive ? "true" : undefined,
      class: cn(sidebarMenuSubButtonVariants({ size }), props.class),
    };

    if (href) {
      return (
        <Link
          {...(props as PropsOf<"a">)}
          {...attrs}
          href={href}
          aria-current={isActive ? "page" : undefined}
        >
          <Slot />
        </Link>
      );
    }

    return (
      <button type="button" {...props} {...attrs}>
        <Slot />
      </button>
    );
  },
);

export const Sidebar = {
  Provider,
  Root,
  Trigger,
  Rail,
  Inset,
  Input,
  Header,
  Footer,
  Separator,
  Content,
  Group,
  GroupLabel,
  GroupAction,
  GroupContent,
  Menu,
  MenuItem,
  MenuButton,
  MenuAction,
  MenuBadge,
  MenuSkeleton,
  MenuSub,
  MenuSubItem,
  MenuSubButton,
};
