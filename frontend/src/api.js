const BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
const TOKEN_KEY = "cj_token";

export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
export const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {} };

async function req(path, { method = "GET", body, auth } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) headers.Authorization = "Bearer " + getToken();
  const r = await fetch(BASE + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(data.error || "Error"), { status: r.status });
  return data;
}

export const fotoUrl = (j) => (j.foto ? `${BASE}/api/jugadores/${j.id}/foto?v=${j.foto}` : null);
export const escudoUrl = (v) => (v ? `${BASE}/api/escudo?v=${v}` : null);

export const api = {
  tabla: () => req("/api/tabla"),
  login: (password) => req("/api/auth/login", { method: "POST", body: { password } }),
  verificar: () => req("/api/auth/verificar", { auth: true }),
  guardarConfig: (cfg) => req("/api/admin/config", { method: "PUT", body: cfg, auth: true }),
  guardarEscudo: (imagen) => req("/api/admin/escudo", { method: "PUT", body: { imagen }, auth: true }),
  crearJugador: (d) => req("/api/admin/jugadores", { method: "POST", body: d, auth: true }),
  editarJugador: (id, d) => req(`/api/admin/jugadores/${id}`, { method: "PUT", body: d, auth: true }),
  borrarJugador: (id) => req(`/api/admin/jugadores/${id}`, { method: "DELETE", auth: true }),
  guardarPuntos: (id, diaId, valor) => req(`/api/admin/jugadores/${id}/puntos`, { method: "PUT", body: { diaId, valor }, auth: true }),
  importar: (data) => req("/api/admin/importar", { method: "POST", body: data, auth: true }),
};
