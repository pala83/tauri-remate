import { component$, useComputed$ } from "@builder.io/qwik";
import { remateActivo } from "~/components/app-state/app-state";
import { CargaRapida } from "~/components/carga-rapida/carga-rapida";
import { LoteForm } from "~/components/lote-form/lote-form";
import { LotesNav } from "~/components/lotes-nav/lotes-nav";
import { LotesPlanilla } from "~/components/lotes-planilla/lotes-planilla";
import { LotesResumen } from "~/components/lotes-resumen/lotes-resumen";
import { FormMessage } from "~/components/page-columns/form-message";
import { PageColumns } from "~/components/page-columns/page-columns";
import { PageToc } from "~/components/page-columns/page-toc";
import { fechaCorta } from "~/lib/fechas";
import { LotesEncabezado } from "./lotes-encabezado";
import { LotesFiltros } from "./lotes-filtros";
import { LotesSinSubasta } from "./lotes-sin-subasta";
import { useLotesPage } from "./use-lotes-page";

export const LotesPage = component$(() => {
  const page = useLotesPage();
  const { virtual, ficha, filas } = page;
  const activa = useComputed$(() => remateActivo(page.state));

  const secciones = [
    { id: "planilla-caja", label: "Planilla", foco: "buscar-lote" },
    { id: "carga-rapida", label: "Carga rápida", foco: "carga-articulo" },
    ...(ficha.value === null
      ? []
      : [
          {
            id: "ficha-lote",
            label: `Ficha del lote N° ${ficha.value}`,
            sub: true,
          },
        ]),
  ];

  return (
    <PageColumns planilla>
      <div q:slot="nav">
        {activa.value && (
          <LotesNav
            titulo={activa.value.nombre}
            proximo={page.resumen.value.proximo}
            bloques={page.bloques.value}
            visible={filas.value[virtual.inicio.value]?.numero ?? 0}
            onCargar$={() => document.getElementById("carga-articulo")?.focus()}
            onSaltar$={page.saltar}
          />
        )}
      </div>
      <div q:slot="toc">
        <PageToc items={secciones} />
        <LotesResumen
          total={page.resumen.value.total}
          duenos={page.resumen.value.duenos}
          sinDetalles={page.resumen.value.sinDetalles}
        />
      </div>
      {!activa.value && page.state.cargado && (
        <LotesSinSubasta error={page.state.error} />
      )}
      {activa.value && (
        <>
          <LotesEncabezado
            remate={`${activa.value.nombre} · ${fechaCorta(activa.value.fecha)}`}
            total={page.resumen.value.total}
            visibles={filas.value.length}
          />
          <LotesFiltros page={page} />
          {page.error.value && (
            <FormMessage mensaje={{ tipo: "error", texto: page.error.value }} />
          )}
          <LotesPlanilla
            filas={filas.value}
            sinLotes={page.resumen.value.total === 0}
            virtual={virtual}
            seleccionada={ficha.value}
            reciente={page.reciente.value}
            onAbrir$={(numero) => (ficha.value = numero)}
          >
            {ficha.value !== null && (
              <LoteForm key={ficha.value} page={page} numero={ficha.value} />
            )}
          </LotesPlanilla>
          <CargaRapida page={page} />
        </>
      )}
    </PageColumns>
  );
});
