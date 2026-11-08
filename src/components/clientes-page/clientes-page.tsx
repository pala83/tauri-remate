import { component$ } from "@builder.io/qwik";
import { ClienteForm } from "~/components/cliente-form/cliente-form";
import { ClientesNav } from "~/components/clientes-nav/clientes-nav";
import { DeudaResumen } from "~/components/deuda-resumen/deuda-resumen";
import { ClientesFiltro } from "~/components/clientes-table/clientes-filtro";
import { ClientesTable } from "~/components/clientes-table/clientes-table";
import { FormMessage } from "~/components/page-columns/form-message";
import { PageColumns } from "~/components/page-columns/page-columns";
import { PageIntro } from "~/components/page-columns/page-intro";
import { PageToc } from "~/components/page-columns/page-toc";
import { SectionHeading } from "~/components/page-columns/section-heading";
import { ClienteDetalle } from "./cliente-detalle";
import { useClientesPage } from "./use-clientes-page";
import { Separator } from "@qwik-ui/headless";

const SECCIONES = [
  { id: "listado", label: "Listado" },
  { id: "ficha-cliente", label: "Ficha del cliente" },
  { id: "liquidacion", label: "Liquidación" },
    { id: "pagos", label: "Pagos" },
  { id: "nuevo-cliente", label: "Nuevo cliente" },
];

const ETIQUETAS = {
  todos: "todos",
  vende: "venden",
  compra: "compran",
  "con-saldo": "con saldo",
};

export const ClientesPage = component$(() => {
  const page = useClientesPage();
  const todos = page.clientes.value;
  const venden = todos.filter((c) => c.aporta > 0);
  const compran = todos.filter((c) => c.compro > 0);
  const conSaldo = todos.filter((c) => page.saldos.value[c.id]?.saldo);
  const filas = {
    todos,
    vende: venden,
    compra: compran,
    "con-saldo": conSaldo,
  }[page.filtro.value];

  return (
    <PageColumns>
      <ClientesNav
        q:slot="nav"
        titulo={`Clientes · ${ETIQUETAS[page.filtro.value]}`}
        clientes={filas}
        seleccionado={page.seleccionado.value}
        onElegir$={page.elegir}
        onNuevo$={page.nuevo}
      />
      <PageToc q:slot="toc" items={SECCIONES} />
      <PageIntro
        eyebrow="Participantes de todos los remates"
        title="Clientes"
      />
      <Separator class="mb-6 border-b-3" />
      {page.error.value && (
        <div class="mt-6">
          <FormMessage mensaje={{ tipo: "error", texto: page.error.value }} />
        </div>
      )}
      {page.activa.value && (
        <DeudaResumen
          remate={page.activa.value.nombre}
          deuda={page.deuda.value}
        />
      )}
      <ClientesFiltro
        filtro={page.filtro}
        cuentas={{
          todos: todos.length,
          vende: venden.length,
          compra: compran.length,
          "con-saldo": conSaldo.length,
        }}
      />
      <ClientesTable
        clientes={filas}
        cargado={page.cargado.value}
        seleccionado={page.seleccionado.value}
        saldos={page.saldos.value}
        onElegir$={page.elegir}
      />
      <ClienteDetalle page={page} />
      <SectionHeading
        id="nuevo-cliente"
        title={page.form.id === null ? "Nuevo cliente" : "Editar cliente"}
      />
      <ClienteForm form={page.form} onGuardado$={page.cargar} />
    </PageColumns>
  );
});
