import { type PropsOf, Slot, component$ } from "@builder.io/qwik";
import { Combobox as HeadlessCombobox } from "@qwik-ui/headless";
import { cn } from "@qwik-ui/utils";
import { LuChevronDown } from "@qwikest/icons/lucide";

const Root = (props: PropsOf<typeof HeadlessCombobox.Root>) => {
  return (
    <HeadlessCombobox.Root
      {...props}
      class={cn("text-popover-foreground flex flex-col", props.class)}
      comboboxItemComponent={Item}
      comboboxItemLabelComponent={ItemLabel}
    >
      {props.children}
    </HeadlessCombobox.Root>
  );
};

const Label = component$<PropsOf<typeof HeadlessCombobox.Label>>(
  ({ ...props }) => {
    return (
      <HeadlessCombobox.Label {...props} class={cn("text-sm", props.class)}>
        <Slot />
      </HeadlessCombobox.Label>
    );
  },
);

const ItemLabel = component$<PropsOf<typeof HeadlessCombobox.ItemLabel>>(
  ({ ...props }) => {
    return (
      <HeadlessCombobox.ItemLabel {...props} class={props.class}>
        <Slot />
      </HeadlessCombobox.ItemLabel>
    );
  },
);

const ItemIndicator = component$<
  PropsOf<typeof HeadlessCombobox.ItemIndicator>
>(({ ...props }) => {
  return (
    <HeadlessCombobox.ItemIndicator
      {...props}
      class={cn("text-sm", props.class)}
    >
      <Slot />
    </HeadlessCombobox.ItemIndicator>
  );
});

const Control = component$<PropsOf<typeof HeadlessCombobox.Control>>(
  (props) => {
    return (
      <HeadlessCombobox.Control
        {...props}
        class={cn("relative flex items-center rounded-sm", props.class)}
      >
        <Slot />
      </HeadlessCombobox.Control>
    );
  },
);

const Input = component$<PropsOf<typeof HeadlessCombobox.Input>>((props) => {
  return (
    <HeadlessCombobox.Input
      {...props}
      class={cn(
        "border-input bg-popover text-foreground placeholder:text-muted-foreground flex h-11.5 w-full rounded-sm border px-3 py-1 text-lg transition-shadow duration-100 placeholder:italic focus:shadow-inner focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
        props.class,
      )}
    />
  );
});

const Trigger = component$<PropsOf<typeof HeadlessCombobox.Trigger>>(
  ({ ...props }) => {
    return (
      <HeadlessCombobox.Trigger
        {...props}
        class={cn("group absolute right-0 h-6 w-6", props.class)}
      >
        <LuChevronDown class="stroke-foreground transition-transform duration-500 group-aria-expanded:-rotate-180" />
      </HeadlessCombobox.Trigger>
    );
  },
);

const Popover = component$<PropsOf<typeof HeadlessCombobox.Popover>>(
  (props) => {
    return (
      <HeadlessCombobox.Popover
        {...props}
        class={cn("bg-card w-48 rounded-sm border p-2", props.class)}
      >
        <Slot />
      </HeadlessCombobox.Popover>
    );
  },
);

const Item = component$<PropsOf<typeof HeadlessCombobox.Item>>(
  ({ ...props }) => {
    return (
      <HeadlessCombobox.Item
        {...props}
        class={cn(
          "group text-foreground aria-disabled:text-muted-foreground hover:bg-muted flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xs px-2.5 py-1.5 text-lg aria-disabled:font-light",
          props.class,
        )}
      >
        <Slot />
      </HeadlessCombobox.Item>
    );
  },
);

const Inline = component$<PropsOf<typeof HeadlessCombobox.Inline>>(
  ({ ...props }) => {
    return (
      <HeadlessCombobox.Inline {...props} class={cn("", props.class)}>
        <Slot />
      </HeadlessCombobox.Inline>
    );
  },
);

const Empty = component$<PropsOf<typeof HeadlessCombobox.Empty>>(
  ({ ...props }) => {
    return (
      <HeadlessCombobox.Empty {...props} class={cn("", props.class)}>
        <Slot />
      </HeadlessCombobox.Empty>
    );
  },
);

export const Combobox = {
  Root,
  Label,
  Control,
  Input,
  Trigger,
  Popover,
  Item,
  ItemLabel,
  ItemIndicator,
  Inline,
  Empty,
};
