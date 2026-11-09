import {
  component$,
  useSignal,
  useTask$,
  type QRL,
  type Signal,
} from "@builder.io/qwik";
import { ConfirmarDialogo } from "~/components/confirmar/confirmar-dialogo";
import { titulo } from "~/lib/textos";
import type { Unificar } from "./use-guardar-cliente";

type UnificarDialogoProps = {
  unificar: Signal<Unificar | undefined>;
  onUnificar$: QRL<() => Promise<void>>;
};

/** «¿Unificar clientes?», when an edited client takes another's name. */
export const UnificarDialogo = component$<UnificarDialogoProps>(
  ({ unificar, onUnificar$ }) => {
    const abierto = useSignal(false);
    // Kept while it closes, so the text doesn't vanish mid-animation.
    const ultimo = useSignal<Unificar>();

    useTask$(({ track }) => {
      const u = track(() => unificar.value);
      if (u) ultimo.value = u;
      abierto.value = u !== undefined;
    });
    // Closed with Esc or a click outside: nothing is unified.
    useTask$(({ track }) => {
      if (!track(() => abierto.value)) unificar.value = undefined;
    });

    const queda = titulo(ultimo.value?.queda.nombre ?? "");
    const seVa = titulo(ultimo.value?.seVa.nombre ?? "");

    return (
      <ConfirmarDialogo
        abierto={abierto}
        titulo="¿Unificar clientes?"
        accion="Unificar"
        onConfirmar$={onUnificar$}
      >
        Ya existe <strong>{queda}</strong>. Los lotes, liquidaciones y pagos de{" "}
        <strong>{seVa}</strong> pasan a <strong>{queda}</strong>, y{" "}
        <strong>{seVa}</strong> se elimina.
      </ConfirmarDialogo>
    );
  },
);
