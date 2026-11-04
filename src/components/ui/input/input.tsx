import { $, component$, type PropsOf } from "@builder.io/qwik";
import { cn } from "@qwik-ui/utils";

type InputProps = PropsOf<"input"> & {
  error?: string;
  /** The id of a <datalist> with suggestions. */
  list?: string;
};

export const Input = component$<InputProps>(
  ({ name, error, id, ["bind:value"]: bindSig, value, onInput$, ...props }) => {
    const inputId = id || name;

    return (
      <>
        <input
          {...props}
          aria-errormessage={`${inputId}-error`}
          aria-invalid={!!error}
          // workaround to support two way data-binding on the Input component (https://github.com/QwikDev/qwik/issues/3926)
          value={bindSig ? bindSig.value : value}
          onInput$={[
            bindSig && $((_, el) => (bindSig.value = el.value)),
            onInput$,
          ]}
          class={cn(
            "border-input bg-popover text-foreground file:text-foreground placeholder:text-muted-foreground flex h-11.5 w-full rounded-sm border px-3 py-1 text-lg transition-shadow duration-100 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:italic focus:shadow-inner focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            props.class,
          )}
          id={inputId}
          name={name}
        />
        {error && (
          <div id={`${inputId}-error`} class="text-alert mt-1 text-sm">
            {error}
          </div>
        )}
      </>
    );
  },
);
