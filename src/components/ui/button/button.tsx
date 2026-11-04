import { component$, type PropsOf, Slot } from "@builder.io/qwik";
import { cn } from "@qwik-ui/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Lifts 1px under the cursor and sinks onto its shadow when pressed.
const relieve =
  "border-base shadow-sm hover:not-active:-translate-x-px hover:not-active:-translate-y-px hover:not-active:shadow-md active:press active:shadow-base";

export const buttonVariants = cva(
  "group inline-flex cursor-pointer items-center justify-center rounded-sm font-mono text-sm font-bold transition-all duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      look: {
        primary: `${relieve} bg-primary text-primary-foreground`,
        secondary: `${relieve} bg-secondary text-secondary-foreground`,
        alert: `${relieve} bg-alert text-alert-foreground`,
        outline: `${relieve} bg-card text-foreground`,
        ghost: "text-foreground hover:bg-muted",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-11 px-3.5",
        md: "h-11 px-5",
        lg: "h-16 px-8 py-4 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      look: "primary",
      size: "md",
    },
  },
);

type ButtonProps = PropsOf<"button"> & VariantProps<typeof buttonVariants>;

export const Button = component$<ButtonProps>(({ size, look, ...props }) => {
  return (
    <button {...props} class={cn(buttonVariants({ size, look }), props.class)}>
      <Slot />
    </button>
  );
});
