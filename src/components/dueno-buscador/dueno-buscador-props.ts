import type { QRL } from "@builder.io/qwik";
import type { ClienteResumen } from "~/db/clientes";

export type DuenoBuscadorProps = {
  id: string;
  clientes: ClienteResumen[];
  recientes: number[];
  cuentas: Record<number, number>;
  duenoId: number | null;
  /** Floats the list above the field; otherwise a scrolling panel clips it. */
  arriba?: boolean;
  /** Floats the list below the field, over what comes after it. */
  abajo?: boolean;
  onElegir$: QRL<(id: number, conEnter: boolean) => void>;
  onNuevo$: QRL<(nombre: string) => Promise<number>>;
  onEnter$?: QRL<() => void>; // Enter with the list closed
};

/** Where the list goes: floating over the page, or in the flow below the field. */
const FLOTA = "absolute inset-x-0 z-30 max-h-96 overflow-y-auto shadow-2xl";
export const posicion = ({ arriba, abajo }: DuenoBuscadorProps) =>
  arriba
    ? `${FLOTA} bottom-full mb-2`
    : abajo
      ? `${FLOTA} top-full mt-2`
      : "mt-2";
