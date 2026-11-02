/** Comprime imagem no navegador para data URL (JPEG) — ideal para foto 3x4 / carteirinha */

export async function fileToCompressedDataUrl(
  file: File | Blob,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number }
): Promise<string> {
  const maxWidth = options?.maxWidth ?? 480;
  const maxHeight = options?.maxHeight ?? 640;
  const quality = options?.quality ?? 0.82;

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não disponível");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", quality);
}

export async function clipboardImageToDataUrl(): Promise<string | null> {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const type = item.types.find((t) => t.startsWith("image/"));
      if (!type) continue;
      const blob = await item.getType(type);
      return fileToCompressedDataUrl(blob);
    }
  } catch {
    return null;
  }
  return null;
}
