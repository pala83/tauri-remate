import {
  createContextId,
  useContext,
  type QRL,
  type Signal,
} from "@builder.io/qwik";

export type SidebarSide = "left" | "right";

export interface SidebarContext {
  /** Desktop state: expanded (`true`) or collapsed (`false`). */
  open: Signal<boolean>;
  /** Drawer state below the mobile breakpoint. */
  openMobile: Signal<boolean>;
  isMobile: Signal<boolean>;
  /** Set by `Sidebar.Root`, used to place tooltips on the opposite side. */
  side: Signal<SidebarSide>;
  /** Toggles the drawer on mobile and the desktop sidebar otherwise. */
  toggle$: QRL<() => void>;
}

export const sidebarContextId = createContextId<SidebarContext>("qui-sidebar");

export const useSidebar = () => useContext(sidebarContextId);
