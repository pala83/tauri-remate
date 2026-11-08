import { $ } from "@builder.io/qwik";
import { devolverPagos, escribirVentas } from "~/db/ventas";
import { proximoSinVender } from "~/lib/martillo";
import { ventaSeparar, ventasQuitar } from "~/lib/martillo-ventas";
import type { MartilloState } from "./use-martillo";
import { useAdjudicar } from "./use-adjudicar";
import { enfocar, useMartilloEscritura } from "./use-martillo-escritura";
import { useMartilloGrupo } from "./use-martillo-grupo";

export const useMartilloAcciones = (m: MartilloState) => {
  const { escribir, fallar } = useMartilloEscritura(m);
  const adjudicar = useAdjudicar(m);
  const grupo = useMartilloGrupo(m);

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

  const quitar = $(async () => {
    const lote = m.lote.value;
    if (!lote) return;
    try {
      await escribir(lote.numero, ventasQuitar(m.lotes.value, lote.numero), [
        lote.numero,
      ]);
    } catch (err) {
      return fallar(err);
    }
    m.mensaje.value = {
      tipo: "ok",
      texto: `El N° ${lote.numero} quedó sin vender.`,
    };
    await m.cargarLote(lote.numero);
  });

  const separar = $(async () => {
    const lote = m.lote.value;
    if (!lote) return;
    try {
      await escribir(lote.numero, ventaSeparar(lote), []);
    } catch (err) {
      return fallar(err);
    }
    m.mensaje.value = {
      tipo: "ok",
      texto: `El N° ${lote.numero} se separó del conjunto y quedó sin vender.`,
    };
    await m.cargarLote(lote.numero);
    enfocar("r-precio");
  });

  const revertir = $(async () => {
    const guardado = m.deshacer.value;
    if (!guardado) return;
    try {
      await escribirVentas(m.state.activoId!, guardado.ventas);
      await devolverPagos(guardado.pagos);
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
