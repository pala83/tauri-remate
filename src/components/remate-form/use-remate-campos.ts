import { $, useSignal, type QRL } from "@builder.io/qwik";
import { conCambios } from "~/lib/cambios";
import { errorRemate, valoresRemate, type RemateCampos } from "~/lib/remates";
import { errorTxt } from "~/lib/textos";
import {
  useFotoRemate,
  useGuardarRemate,
  useOlvidarRemate,
  type ClaveRemate,
} from "~/store";

type Valores = ReturnType<typeof valoresRemate>;

const VACIO: RemateCampos = { nombre: "", fecha: "", lugar: "" };

/**
 * The fields of a remate, for creating one (`id` null) or editing it. What's
 * written survives going to another tab and back. A new one is all typed by
 * the user; one being edited is filled with `rellenar`, from the database.
 */
export const useRemateCampos = (clave: ClaveRemate, id: number | null) => {
  const foto = useFotoRemate(clave);
  const desde = id === null && foto?.id === null ? foto : VACIO;
  const nombre = useSignal(desde.nombre);
  const fecha = useSignal(desde.fecha);
  const lugar = useSignal(desde.lugar);
  const guardando = useSignal(false);
  /** What the database said for the remate being edited. */
  const base = useSignal<RemateCampos | null>(null);
  useGuardarRemate(clave, { id, nombre, fecha, lugar, base });
  const olvidar = useOlvidarRemate(clave);

  /** Fills it from `fresco`, read from the database: a draft keeps only what the user changed. */
  const rellenar = $((fresco: RemateCampos) => {
    const previo =
      foto?.id === id && foto.base
        ? {
            base: foto.base,
            form: { nombre: foto.nombre, fecha: foto.fecha, lugar: foto.lugar },
          }
        : undefined;
    const lleno = conCambios(fresco, previo);
    nombre.value = lleno.form.nombre;
    fecha.value = lleno.form.fecha;
    lugar.value = lleno.form.lugar;
    base.value = lleno.base;
  });

  /** Validates and saves. Returns the error to show, if any. */
  const enviar = $(
    async (guardar: QRL<(valores: Valores) => Promise<void>>) => {
      // A second click while saving would save it twice.
      if (guardando.value) return undefined;
      const campos = {
        nombre: nombre.value,
        fecha: fecha.value,
        lugar: lugar.value,
      };
      const error = errorRemate(campos);
      if (error) return error;
      guardando.value = true;
      try {
        await guardar(valoresRemate(campos));
        return undefined;
      } catch (err) {
        return errorTxt(err);
      } finally {
        guardando.value = false;
      }
    },
  );

  const vaciar = $(() => {
    nombre.value = fecha.value = lugar.value = "";
  });

  return {
    nombre,
    fecha,
    lugar,
    guardando,
    base,
    enviar,
    vaciar,
    olvidar,
    rellenar,
  };
};
