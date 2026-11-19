export const initials = (n) => (n || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
export const fmt = (n) => (Math.round(n * 100) / 100).toLocaleString("es-UY");

const DSEM = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export function diaLabel(d) {
  if (!d) return "";
  if (d.nombre) return d.nombre;
  if (!d.fecha) return "Día";
  const [y, m, dd] = d.fecha.split("-").map(Number);
  const dt = new Date(y, m - 1, dd);
  return `${DSEM[dt.getDay()]} ${String(dd).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}
export const sortDias = (dias) => [...dias].sort((a, b) => (a.fecha || "9999").localeCompare(b.fecha || "9999"));
export function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export const nuevoId = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

export const ptsDia = (j, did) => Number((j.puntos || {})[did]) || 0;
export const ptsSemana = (j, s) => (s ? s.dias.reduce((a, d) => a + ptsDia(j, d.id), 0) : 0);
export const total = (j, semanas) => semanas.reduce((a, s) => a + ptsSemana(j, s), 0);

// vista: { semana: id|null, dia: id|null }
export function ranking(jugadores, semanas, vista) {
  const s = vista.semana ? semanas.find((x) => x.id === vista.semana) : null;
  const score = (j) => (!s ? total(j, semanas) : vista.dia ? ptsDia(j, vista.dia) : ptsSemana(j, s));
  const arr = jugadores.map((j) => ({ j, s: score(j) }));
  arr.sort((a, b) => b.s - a.s || a.j.nombre.localeCompare(b.j.nombre, "es"));
  let pos = 0, last = null;
  arr.forEach((r, i) => { if (r.s !== last) { pos = i + 1; last = r.s; } r.pos = pos; });
  return arr;
}

// Recorta cuadrada y achica a 400px → dataURL jpeg
export function prepararFoto(file, size = 400) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const c = document.createElement("canvas"); c.width = size; c.height = size;
      c.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      res(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("img")); };
    img.src = url;
  });
}

// Escudo: mantiene proporción y transparencia (PNG), máx 512px
export function prepararEscudo(file, max = 512) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL("image/png"));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("img")); };
    img.src = url;
  });
}
