import { $, component$ } from "@builder.io/qwik";
import { ClienteFicha } from "~/components/cliente-ficha/cliente-ficha";
import { LiquidacionSeccion } from "~/components/liquidacion/liquidacion-seccion";
import { useLiquidacion } from "~/components/liquidacion/use-liquidacion";
import { SectionHeading } from "~/components/page-columns/section-heading";
import { PagosSeccion } from "~/components/pagos/pagos-seccion";
import { listarClientes, marcarSinComision } from "~/db/clientes";
import { irA } from "~/lib/scroll";
import { errorTxt, titulo } from "~/lib/textos";
import type { ClientesPageState } from "./use-clientes-page";

/** Everything about the chosen client: their card, settlement and payments. */
export const ClienteDetalle = component$<{ page: ClientesPageState }>(
  ({ page }) => {
    const actual = page.actual.value;
    const liquidacion = useLiquidacion(page.actual, page.leerSaldos);

    const editar = $(() => {
      const cliente = page.actual.value;
      if (!cliente) return;
      Object.assign(page.form, {
        id: cliente.id,
        nombre: titulo(cliente.nombre),
        telefono: cliente.telefono ?? "",
        email: cliente.email ?? "",
        referido: titulo(cliente.referido ?? ""),
      });
      irA("nuevo-cliente", "cliente-nombre");
    });

    const cambiarSinComision = $(async () => {
      const cliente = page.actual.value;
      if (!cliente) return;
      try {
        await marcarSinComision(cliente.id, !cliente.sinComision);
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
          page.cargado.value && (
            <p class="text-muted-foreground text-lg italic">
              Elegí un cliente del listado.
            </p>
          )
        )}
        {page.actual.value && (
          <>
            <LiquidacionSeccion
              estado={liquidacion}
              cliente={page.actual}
              clienteId={page.actual.value.id}
              nombre={page.actual.value.nombre}
            />
            <PagosSeccion estado={liquidacion} />
          </>
        )}
      </>
    );
  },
);
