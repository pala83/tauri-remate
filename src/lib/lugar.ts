/** Sites accepted as a remate's place; `capabilities/default.json` allows the same ones. */
const SITIOS_MAPS = ["maps.google.com", "maps.google.com.ar", "maps.app.goo.gl"];
const SITIOS_CON_RUTA: Record<string, string> = {
  "www.google.com": "/maps",
  "www.google.com.ar": "/maps",
  "goo.gl": "/maps",
};

export const esLinkDeMaps = (valor: string) => {
  try {
    const { href, hostname, pathname } = new URL(valor);
    // Also leaves out other protocols, ports and credentials.
    if (!href.startsWith(`https://${hostname}/`)) return false;
    if (SITIOS_MAPS.includes(hostname)) return true;
    const ruta = SITIOS_CON_RUTA[hostname];
    return ruta !== undefined && (pathname === ruta || pathname.startsWith(`${ruta}/`));
  } catch {
    return false;
  }
};

/** Opens the place in the system's browser: the webview can't navigate out by itself. */
export async function abrirLugar(url: string) {
  const { openUrl } = await import("@tauri-apps/plugin-opener");
  await openUrl(url);
}
