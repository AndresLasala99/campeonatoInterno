const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX = 3 * 1024 * 1024; // 3 MB

// Convierte "data:image/jpeg;base64,...." en { data: Buffer, tipo }
export function dataUrlAImagen(dataUrl) {
  if (typeof dataUrl !== "string") return null;
  const m = dataUrl.match(/^data:([\w/+.-]+);base64,(.+)$/);
  if (!m) throw new Error("Imagen inválida");
  const tipo = m[1];
  if (!TIPOS.includes(tipo)) throw new Error("Formato de imagen no soportado");
  const data = Buffer.from(m[2], "base64");
  if (data.length > MAX) throw new Error("La imagen es muy pesada");
  return { data, tipo };
}
