import { $, component$ } from "@builder.io/qwik";
import { ClienteFicha } from "~/components/cliente-ficha/cliente-ficha";
import { LiquidacionSeccion } from "~/components/liquidacion/liquidacion-seccion";
import { useLiquidacion } from "~/components/liquidacion/use-liquidacion";
import { SectionHeading } from "~/components/page-columns/section-heading";
import { PagosSeccion } from "~/components/pagos/pagos-seccion";
import { desdeCliente } from "~/components/cliente-form/cliente-form-state";
import { leerCliente, listarClientes, marcarSinComision } from "~/db/clientes";
import { irA } from "~/lib/scroll";
import { errorTxt } from "~/lib/textos";
import type { ClientesPageState } from "./use-clientes-page";

/** Everything about the chosen client: their card, settlement and payments. */
export const ClienteDetalle = component$<{ page: ClientesPageState }>(
  ({ page }) => {
    const actual = page.actual.value;
    const liquidacion = useLiquidacion(page.actual, page.leerSaldos);

    // Both read the client from the database, not from the list on screen.
    const editar = $(async () => {
      const id = page.actual.value?.id;
      if (id === undefined) return;
      try {
        await page.editarCliente(desdeCliente(await leerCliente(id)));
      } catch (err) {
        page.error.value = errorTxt(err);
        return;
      }
      irA("nuevo-cliente", "cliente-nombre");
    });

    const cambiarSinComision = $(async () => {
      const id = page.actual.value?.id;
      if (id === undefined) return;
      try {
        const { sinComision } = await leerCliente(id);
        await marcarSinComision(id, !sinComision);
        page.clientes.value = await listarClientes();
      } catch (err) {
        page.error.value = errorTxt(err);
      }
    });

    return (
      <>
        <SectionHeading id="ficha-cliente" title="Ficha del cliente" />
        {actual && page.historial.value ? (
          <ClienteFicha
            cliente={actual}
            historial={page.historial.value}
            onEditar$={editar}
            onSinComision$={cambiarSinComision}
          />
        ) : (
          page.cargado.value &&
          !actual && (
            <p class="text-muted-foreground text-lg italic">
              Elegí un cliente del listado.
            </p>
          )
        )}
        {page.actual.value && (
          <>
            <LiquidacionSeccion estado={liquidacion} cliente={page.actual} />
            <PagosSeccion estado={liquidacion} />
          </>
        )}
      </>
    );
  },
);
