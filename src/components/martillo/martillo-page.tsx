import {
  $,
  component$,
  sync$,
  useComputed$,
  useOnDocument,
} from "@builder.io/qwik";
import { remateActivo } from "~/components/app-state/app-state";
import { LotesSinSubasta } from "~/components/lotes-page/lotes-sin-subasta";
import { PageColumns } from "~/components/page-columns/page-columns";
import { PageToc } from "~/components/page-columns/page-toc";
import { fechaCorta } from "~/lib/fechas";
import { MartilloEncabezado } from "./martillo-encabezado";
import { MartilloLote } from "./martillo-lote";
import { MartilloNav } from "./martillo-nav";
import { MartilloPlanilla } from "./martillo-planilla";
import { MartilloResumen } from "./martillo-resumen";
import { useMartillo } from "./use-martillo";
import { useMartilloAcciones } from "./use-martillo-acciones";

const SECCIONES = [
  { id: "martillo", label: "En el martillo", foco: "r-precio" },
  { id: "planilla-caja", label: "Planilla" },
];

export const MartilloPage = component$(() => {
  const m = useMartillo();
  const acciones = useMartilloAcciones(m);
  const activa = useComputed$(() => remateActivo(m.state));

  // Ctrl P would open the print dialog: it has to be stopped synchronously.
  useOnDocument(
    "keydown",
    sync$((e: KeyboardEvent) => {
      if (e.ctrlKey && /^(Digit[1-5]|KeyP|KeyJ)$/.test(e.code))
        e.preventDefault();
    }),
  );
  useOnDocument(
    "keydown",
    $((e: KeyboardEvent) => {
      if (!e.ctrlKey) return;
      if (e.code === "KeyP") return acciones.pasar();
      if (e.code === "KeyJ") return acciones.agregarSiguiente();
      if (/^Digit[1-5]$/.test(e.code)) {
        const id = m.recientes.value[Number(e.code.slice(5)) - 1];
        if (id) m.compradorId.value = id;
      }
    }),
  );

  return (
    <PageColumns planilla desplazable>
      <div q:slot="nav">
        {activa.value && <MartilloNav m={m} titulo={activa.value.nombre} />}
      </div>
      <div q:slot="toc">
        <PageToc items={SECCIONES} />
        <MartilloResumen m={m} />
      </div>
      {!activa.value && m.state.cargado && (
        <LotesSinSubasta error={m.state.error} />
      )}
      {activa.value && (
        <>
          <MartilloEncabezado
            m={m}
            remate={`${activa.value.nombre} · ${fechaCorta(activa.value.fecha)}`}
          />
          <MartilloLote m={m} acciones={acciones} />
          <MartilloPlanilla m={m} />
        </>
      )}
    </PageColumns>
  );
});
