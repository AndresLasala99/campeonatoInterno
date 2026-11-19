import { getConfig, Config } from "../models/Config.js";
import { Jugador } from "../models/Jugador.js";
import { dataUrlAImagen } from "../services/imagen.js";

const ID = /^[\w-]{1,40}$/;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const err = (msg, status = 400) => Object.assign(new Error(msg), { status });

function limpiarSemanas(semanas) {
  if (!Array.isArray(semanas)) throw err("Semanas inválidas");
  return semanas.map((s) => {
    if (!s || !ID.test(s.id)) throw err("Semana inválida");
    return {
      id: s.id,
      nombre: String(s.nombre || "Semana").slice(0, 40),
      dias: (Array.isArray(s.dias) ? s.dias : []).map((d) => {
        if (!d || !ID.test(d.id)) throw err("Día inválido");
        return { id: d.id, fecha: FECHA.test(d.fecha) ? d.fecha : null, nombre: String(d.nombre || "").slice(0, 30) };
      }),
    };
  });
}

export async function guardarConfig(req, res) {
  const c = await getConfig();
  if (typeof req.body.titulo === "string") c.titulo = req.body.titulo.trim().slice(0, 80) || c.titulo;
  if (req.body.semanas) c.semanas = limpiarSemanas(req.body.semanas);
  await c.save();
  res.json({ ok: true });
}

export async function guardarEscudo(req, res) {
  const c = await getConfig();
  if (req.body.imagen) c.escudo = dataUrlAImagen(req.body.imagen);
  else c.escudo = undefined;
  c.escudoVersion = Date.now();
  await c.save();
  res.json({ ok: true });
}

export async function crearJugador(req, res) {
  const nombre = String(req.body.nombre || "").trim();
  if (!nombre) throw err("Falta el nombre");
  const doc = { nombre };
  if (req.body.foto) { doc.foto = dataUrlAImagen(req.body.foto); doc.fotoVersion = Date.now(); }
  const j = await Jugador.create(doc);
  res.status(201).json({ id: String(j._id) });
}

export async function editarJugador(req, res) {
  const j = await Jugador.findById(req.params.id);
  if (!j) throw err("Jugador no encontrado", 404);
  if (req.body.nombre !== undefined) {
    const n = String(req.body.nombre).trim();
    if (!n) throw err("Falta el nombre");
    j.nombre = n;
  }
  if (req.body.foto) { j.foto = dataUrlAImagen(req.body.foto); j.fotoVersion = Date.now(); }
  if (req.body.quitarFoto) { j.foto = undefined; j.fotoVersion = Date.now(); }
  await j.save();
  res.json({ ok: true });
}

export async function borrarJugador(req, res) {
  await Jugador.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}

export async function guardarPuntos(req, res) {
  const { diaId, valor } = req.body;
  if (!ID.test(diaId || "")) throw err("Día inválido");
  const v = Number(valor);
  if (!Number.isFinite(v)) throw err("Número inválido");
  const r = await Jugador.updateOne({ _id: req.params.id }, { $set: { [`puntos.${diaId}`]: v } });
  if (!r.matchedCount) throw err("Jugador no encontrado", 404);
  res.json({ ok: true });
}

// Importa el archivo exportado desde la tabla anterior (reemplaza todo)
export async function importar(req, res) {
  const d = req.body;
  if (!d || d.formato !== "campeonato-juventud" || !d.config || !Array.isArray(d.jugadores)) throw err("Archivo inválido");
  const semanas = limpiarSemanas(d.config.semanas || []);
  const jugadores = d.jugadores.map((j) => {
    const nombre = String(j.nombre || "").trim();
    if (!nombre) throw err("Hay un jugador sin nombre");
    const puntos = {};
    for (const [k, v] of Object.entries(j.puntos || {})) if (ID.test(k) && Number.isFinite(Number(v))) puntos[k] = Number(v);
    const doc = { nombre, puntos };
    if (j.foto) { doc.foto = dataUrlAImagen(j.foto); doc.fotoVersion = Date.now(); }
    return doc;
  });

  await Jugador.deleteMany({});
  if (jugadores.length) await Jugador.insertMany(jugadores);
  await Config.deleteMany({});
  await Config.create({
    clave: "general",
    titulo: String(d.config.titulo || "Campeonato interno - entrenamientos Juventud").slice(0, 80),
    semanas,
    escudo: d.config.escudo ? dataUrlAImagen(d.config.escudo) : undefined,
    escudoVersion: Date.now(),
  });
  res.json({ ok: true, jugadores: jugadores.length, semanas: semanas.length });
}
