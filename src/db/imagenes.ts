import { convertFileSrc } from "@tauri-apps/api/core";

const CARPETA = "imagenes";

/** Opens the system picker and copies the image into the app's folder. */
export async function elegirImagen(): Promise<string | null> {
  const { open } = await import("@tauri-apps/plugin-dialog");
  const origen = await open({
    multiple: false,
    filters: [{ name: "Imágenes", extensions: ["jpg", "jpeg", "png", "webp"] }],
  });
  if (!origen) return null;

  const { appConfigDir, join } = await import("@tauri-apps/api/path");
  const { copyFile, mkdir } = await import("@tauri-apps/plugin-fs");
  const carpeta = await join(await appConfigDir(), CARPETA);
  await mkdir(carpeta, { recursive: true });

  const extension = origen.split(".").pop()?.toLowerCase() ?? "jpg";
  const destino = await join(carpeta, `${crypto.randomUUID()}.${extension}`);
  await copyFile(origen, destino);
  return destino;
}

export const urlImagen = (ruta: string) => convertFileSrc(ruta);
