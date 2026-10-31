import { component$, Slot, useTask$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { LuGavel, LuLayoutDashboard, LuSettings } from "@qwikest/icons/lucide";
import { Separator, Sidebar, useSidebar } from "~/components/ui";

export default component$(() => {
  return (
    <Sidebar.Provider>
      <AppSidebar />
      <Sidebar.Inset>
        <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Sidebar.Trigger />
          <Separator orientation="vertical" class="h-6" />
          <span class="font-bold">Remates Palazzo</span>
        </header>
        <Slot />
      </Sidebar.Inset>
    </Sidebar.Provider>
  );
});

const AppSidebar = component$(() => {
  const location = useLocation();
  const sidebar = useSidebar();

  // Close the mobile drawer after navigating.
  useTask$(({ track }) => {
    track(() => location.url.pathname);
    sidebar.openMobile.value = false;
  });

  const isActive = (href: string) => location.url.pathname === href;

  return (
    <Sidebar.Root collapsible="icon">
      <Sidebar.Header>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton size="lg" href="/" tooltip="Remates Palazzo">
              <LuGavel />
              <span>Remates Palazzo</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Header>
      <Sidebar.Separator />
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Gestión</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton
                  href="/"
                  isActive={isActive("/")}
                  tooltip="Remates"
                >
                  <LuLayoutDashboard />
                  <span>Remates</span>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>
      <Sidebar.Footer>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton tooltip="Configuración">
              <LuSettings />
              <span>Configuración</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Footer>
      <Sidebar.Rail />
    </Sidebar.Root>
  );
});
