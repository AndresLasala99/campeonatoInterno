import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireAdmin(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No autorizado" });
  try {
    const p = jwt.verify(token, env.jwtSecret);
    if (p.rol !== "admin") throw new Error();
    next();
  } catch {
    res.status(401).json({ error: "Sesión vencida, volvé a entrar" });
  }
}
