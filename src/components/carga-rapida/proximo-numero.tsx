import { component$ } from "@builder.io/qwik";

export const ProximoNumero = component$<{ numero: number }>(({ numero }) => {
  return (
    <div class="bg-primary text-primary-foreground flex h-17.5 w-19 shrink-0 flex-col items-center justify-center self-center rounded-sm border shadow-xs">
      <span class="font-mono text-xs tracking-widest">PRÓXIMO</span>
      <span class="font-serif text-3xl leading-none">{numero}</span>
    </div>
  );
});
