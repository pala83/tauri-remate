import { $, useComputed$, useSignal, useTask$ } from "@builder.io/qwik";
import type { DuenoBuscadorProps } from "./dueno-buscador";
import { nombreDe, opcionesDe, type OpcionDueno } from "./opciones-dueno";

/**
 * The list is Qwik UI's combobox, which handles the mouse. The field is a plain
 * Input because Combobox.Input adds its own key handlers to any we pass: Enter
 * would choose twice, and it clears the highlight when typing.
 */
export const useDuenoBuscador = (props: DuenoBuscadorProps) => {
  const texto = useSignal("");
  const editando = useSignal(false);
  const abierto = useSignal(false);
  const activo = useSignal(0);
  const seleccion = useSignal("");
  const eligiendo = useSignal(false);

  useTask$(({ track }) => {
    const id = track(() => props.duenoId);
    const clientes = track(() => props.clientes);
    if (track(() => editando.value)) return;
    texto.value = nombreDe(clientes, id);
  });

  const lista = useComputed$(() =>
    abierto.value
      ? opcionesDe(
          props.clientes,
          props.recientes,
          props.cuentas,
          editando.value ? texto.value : "",
        )
      : [],
  );
  const indice = useComputed$(() =>
    Math.min(activo.value, lista.value.length - 1),
  );

  const cerrar = $(() => {
    abierto.value = false;
    editando.value = false;
    activo.value = 0;
  });

  const elegir = $(async (opcion: OpcionDueno, conEnter: boolean) => {
    // Enter again while creating the client can't create a second one.
    if (eligiendo.value) return;
    eligiendo.value = true;
    try {
      const id = opcion.id ?? (await props.onNuevo$(opcion.nombre));
      await cerrar();
      await props.onElegir$(id, conEnter);
    } finally {
      eligiendo.value = false;
    }
  });

  const teclas = $(async (e: KeyboardEvent) => {
    const largo = lista.value.length;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!abierto.value) abierto.value = true;
      else if (largo) {
        const paso = e.key === "ArrowDown" ? 1 : -1;
        activo.value = (indice.value + paso + largo) % largo;
        document
          .getElementById(`${props.id}-opciones-${activo.value}`)
          ?.scrollIntoView({ block: "nearest" });
      }
    } else if (e.key === "Enter" && !e.repeat) {
      if (largo) await elegir(lista.value[indice.value], true);
      else await props.onEnter$?.();
    } else if (e.key === "Escape") {
      await cerrar();
    }
  });

  const escribir = $((valor: string) => {
    texto.value = valor;
    editando.value = abierto.value = true;
    activo.value = 0;
  });

  const alCambiar = $(async (valor: string | string[]) => {
    seleccion.value = ""; // or choosing it again would unselect it
    const opcion = lista.value.find((o) => o.clave === valor);
    if (opcion) await elegir(opcion, false);
  });

  return {
    texto,
    editando,
    seleccion,
    lista,
    indice,
    cerrar,
    teclas,
    escribir,
    alCambiar,
  };
};
