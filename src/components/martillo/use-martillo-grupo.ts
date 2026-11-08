import { $ } from "@builder.io/qwik";
import { crearCliente, listarClientes } from "~/db/clientes";
import type { MartilloState } from "./use-martillo";

export const useMartilloGrupo = (m: MartilloState) => {
  /** Adds a lot to those sold together. Returns what went wrong, if anything. */
  const agregarAlGrupo = $((n: number) => {
    const lote = m.lotes.value.find((l) => l.numero === n);
    if (!lote) return `No existe el N° ${n}.`;
    if (n === m.numero.value) return "Es el lote que está en el martillo.";
    if (m.grupo.value.includes(n)) return `El N° ${n} ya está en el conjunto.`;
    if (lote.compradorId !== null) return `El N° ${n} ya está vendido.`;
    m.grupo.value = [...m.grupo.value, n].sort((a, b) => a - b);
    return undefined;
  });

  const agregarSiguiente = $(async () => {
    const tope = Math.max(m.numero.value ?? 0, ...m.grupo.value);
    const sigue = m.lotes.value.find(
      (l) => l.numero > tope && l.compradorId === null,
    );
    if (!sigue) {
      m.mensaje.value = { tipo: "info", texto: "No hay otro lote para sumar." };
      return;
    }
    await agregarAlGrupo(sigue.numero);
  });

  const crearComprador = $(async (nombre: string) => {
    const id = await crearCliente({ nombre });
    m.clientes.value = await listarClientes();
    return id;
  });

  return { agregarAlGrupo, agregarSiguiente, crearComprador };
};
