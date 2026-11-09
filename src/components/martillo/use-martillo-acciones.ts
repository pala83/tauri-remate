import { $ } from "@builder.io/qwik";
import { escribirVentas } from "~/db/ventas";
import { proximoSinVender } from "~/lib/martillo";
import type { MartilloState } from "./use-martillo";
import { useAdjudicar } from "./use-adjudicar";
import { enfocar, useMartilloEscritura } from "./use-martillo-escritura";
import { useMartilloGrupo } from "./use-martillo-grupo";
import { useQuitarVenta } from "./use-quitar-venta";

export const useMartilloAcciones = (m: MartilloState) => {
  const escritura = useMartilloEscritura(m);
  const { fallar } = escritura;
  const adjudicar = useAdjudicar(m, escritura);
  const grupo = useMartilloGrupo(m);
  const { quitar, separar } = useQuitarVenta(m, escritura);

  const pasar = $(async () => {
    const actual = m.numero.value ?? 0;
    const sigue = proximoSinVender(m.lotes.value, actual);
    if (!sigue) {
      m.mensaje.value = { tipo: "info", texto: "No hay otro lote sin vender." };
      return;
    }
    m.mensaje.value = undefined;
    await m.cargarLote(sigue.numero);
    enfocar("r-precio");
  });

  const revertir = $(async () => {
    const guardado = m.deshacer.value;
    if (!guardado) return;
    try {
      await escribirVentas(m.state.activoId!, guardado.ventas, {
        devolver: guardado.pagos,
      });
      await m.leer();
    } catch (err) {
      return fallar(err);
    }
    m.deshacer.value = undefined;
    m.mensaje.value = {
      tipo: "info",
      texto: `Se deshizo el cambio del N° ${guardado.numero}.`,
    };
    await m.cargarLote(guardado.numero);
    enfocar("r-precio");
  });

  return {
    adjudicar,
    pasar,
    quitar,
    separar,
    revertir,
    ...grupo,
  };
};

export type MartilloAcciones = ReturnType<typeof useMartilloAcciones>;
