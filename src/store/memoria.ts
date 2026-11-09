import {
  createContextId,
  isSignal,
  useContext,
  useContextProvider,
  useStore,
  useTask$,
  type ReadonlySignal,
} from "@builder.io/qwik";

/**
 * What each page leaves behind when another tab is opened. The layout stays
 * mounted across a `<Link>`, the pages don't: this lives in the layout.
 * It lasts while the app is open; a reload starts it again.
 */
type Memoria = Record<string, unknown>;

const MemoriaContext = createContextId<Memoria>("memoria");

export const useMemoriaProvider = () => {
  useContextProvider(MemoriaContext, useStore<Memoria>({}, { deep: false }));
};

/** Each value is a signal, or a store read whole. */
export type Campos<T> = {
  [K in keyof T]: ReadonlySignal<T[K]> | T[K];
};

const valores = <T>(campos: Campos<T>) =>
  JSON.parse(
    JSON.stringify(
      Object.fromEntries(
        Object.entries(campos).map(([k, v]) => [k, isSignal(v) ? v.value : v]),
      ),
    ),
  ) as T;

/**
 * What was saved under `clave` when the page was last open. Read it before
 * `useGuardar` of the same key, so a page that resets itself on loading
 * still gets what it had.
 */
export const useFoto = <T>(clave: string) =>
  useContext(MemoriaContext)[clave] as T | undefined;

/** From now on keeps `campos` saved under `clave`. */
export const useGuardar = <T>(clave: string, campos: Campos<T>) => {
  const memoria = useContext(MemoriaContext);
  useTask$(({ track }) => {
    memoria[clave] = track(() => valores(campos));
  });
};

/** For values written outside a task, like a scroll position. */
export const useMemoria = () => useContext(MemoriaContext);
