// Rasmni yuklashdan oldin brauzerda siqish: max o'lcham va JPEG sifatini
// cheklab, ko'zga sezilarli farqsiz holda fayl hajmini kamaytiradi.
export async function compressImage(
  file: File,
  maxDimension = 1920,
  quality = 0.85
): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    if (width > maxDimension || height > maxDimension) {
      const scale = maxDimension / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );

    // Siqilgan fayl kattaroq chiqsa (kamdan-kam), asl faylni saqlaymiz.
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}
