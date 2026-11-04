import { component$ } from "@builder.io/qwik";
import { ClienteFicha } from "~/components/cliente-ficha/cliente-ficha";
import { ClienteForm } from "~/components/cliente-form/cliente-form";
import { ClientesNav } from "~/components/clientes-nav/clientes-nav";
import { ClientesFiltro } from "~/components/clientes-table/clientes-filtro";
import { ClientesTable } from "~/components/clientes-table/clientes-table";
import { FormMessage } from "~/components/page-columns/form-message";
import { PageColumns } from "~/components/page-columns/page-columns";
import { PageIntro } from "~/components/page-columns/page-intro";
import { PageToc } from "~/components/page-columns/page-toc";
import { SectionHeading } from "~/components/page-columns/section-heading";
import { useClientesPage } from "./use-clientes-page";
import { Separator } from "@qwik-ui/headless";

const SECCIONES = [
  { id: "listado", label: "Listado" },
  { id: "ficha-cliente", label: "Ficha del cliente" },
  { id: "nuevo-cliente", label: "Nuevo cliente" },
];

const ETIQUETAS = { todos: "todos", vende: "venden", compra: "compran" };

export const ClientesPage = component$(() => {
  const page = useClientesPage();
  const todos = page.clientes.value;
  const venden = todos.filter((c) => c.aporta > 0);
  const compran = todos.filter((c) => c.compro > 0);
  const filas = { todos, vende: venden, compra: compran }[page.filtro.value];
  const actual = todos.find((c) => c.id === page.seleccionado.value);

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
      <ClientesFiltro
        filtro={page.filtro}
        cuentas={{
          todos: todos.length,
          vende: venden.length,
          compra: compran.length,
        }}
      />
      <ClientesTable
        clientes={filas}
        cargado={page.cargado.value}
        seleccionado={page.seleccionado.value}
        onElegir$={page.elegir}
      />
      <SectionHeading id="ficha-cliente" title="Ficha del cliente" />
      {actual && page.historial.value ? (
        <ClienteFicha
          cliente={actual}
          historial={page.historial.value}
          onEditar$={() => page.editar(actual)}
        />
      ) : (
        page.cargado.value && (
          <p class="text-muted-foreground text-lg italic">
            Elegí un cliente del listado.
          </p>
        )
      )}
      <SectionHeading
        id="nuevo-cliente"
        title={page.form.id === null ? "Nuevo cliente" : "Editar cliente"}
      />
      <ClienteForm form={page.form} onGuardado$={page.cargar} />
    </PageColumns>
  );
});
