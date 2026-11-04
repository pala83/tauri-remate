import {
  $,
  createContextId,
  useContext,
  useContextProvider,
  useStore,
  useVisibleTask$,
  type QRL,
} from "@builder.io/qwik";
import { listarRemates, type RemateResumen } from "~/db/remates";
import { errorTxt } from "~/lib/textos";

const CLAVE_ACTIVO = "remate-activo";

type AppState = {
  remates: RemateResumen[];
  activoId: number | null;
  cargado: boolean;
  error?: string;
};

type AppContext = {
  state: AppState;
  recargar$: QRL<() => Promise<void>>;
  elegir$: QRL<(id: number) => void>;
};

const AppStateContext = createContextId<AppContext>("app-state");

export const useAppState = () => useContext(AppStateContext);

export const remateActivo = (state: AppState) =>
  state.remates.find((remate) => remate.id === state.activoId);

const leerActivo = () => {
  try {
    return Number(localStorage.getItem(CLAVE_ACTIVO)) || null;
  } catch {
    return null;
  }
};

export const useAppStateProvider = () => {
  const state = useStore<AppState>({
    remates: [],
    activoId: null,
    cargado: false,
  });

  const elegir$ = $((id: number) => {
    state.activoId = id;
    try {
      localStorage.setItem(CLAVE_ACTIVO, String(id));
    } catch {
      // Storage unavailable: the choice only lasts for this session.
    }
  });

  const recargar$ = $(async () => {
    try {
      state.remates = await listarRemates();
      const existe = state.remates.some((r) => r.id === state.activoId);
      if (!existe) state.activoId = state.remates[0]?.id ?? null;
      state.error = undefined;
    } catch (err) {
      state.error = errorTxt(err);
    }
    state.cargado = true;
  });

  // The database only exists inside the Tauri webview, so load on the client.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    state.activoId = leerActivo();
    return recargar$();
  });

  useContextProvider(AppStateContext, { state, recargar$, elegir$ });
};
