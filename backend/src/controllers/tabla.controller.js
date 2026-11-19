import { getConfig } from "../models/Config.js";
import { Jugador } from "../models/Jugador.js";

// Lo que ve todo el mundo (sin login)
export async function obtenerTabla(_req, res) {
  const [c, jugadores] = await Promise.all([
    getConfig(),
    Jugador.find({}, { "foto.data": 0 }).sort({ nombre: 1 }).lean(),
  ]);
  res.set("Cache-Control", "no-store");
  res.json({
    titulo: c.titulo,
    semanas: c.semanas,
    escudo: c.escudo?.tipo ? c.escudoVersion : null,
    jugadores: jugadores.map((j) => ({
      id: String(j._id),
      nombre: j.nombre,
      foto: j.foto?.tipo ? j.fotoVersion : null,
      puntos: j.puntos || {},
    })),
  });
}

export async function fotoJugador(req, res) {
  const j = await Jugador.findById(req.params.id, { foto: 1 }).lean();
  if (!j?.foto?.data) return res.status(404).end();
  res.set("Content-Type", j.foto.tipo);
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  res.send(j.foto.data.buffer ? Buffer.from(j.foto.data.buffer) : j.foto.data);
}

export async function escudo(_req, res) {
  const c = await getConfig();
  if (!c.escudo?.data) return res.status(404).end();
  res.set("Content-Type", c.escudo.tipo);
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  res.send(c.escudo.data);
}
