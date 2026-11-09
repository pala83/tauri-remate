import { $ } from "@builder.io/qwik";
import { useMemoria } from "./memoria";

const clave = (pagina: string) => `scroll-${pagina}`;

/** How far down page `pagina` was, and how to save it on every scroll. */
export const useScroll = (pagina: string | undefined) => {
  const memoria = useMemoria();
  const inicial = pagina
    ? (memoria[clave(pagina)] as number | undefined)
    : undefined;

  const guardar = $((top: number) => {
    if (pagina) memoria[clave(pagina)] = top;
  });

  return { inicial, guardar };
};
