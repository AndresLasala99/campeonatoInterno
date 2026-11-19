import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const intentos = new Map(); // ip -> { n, hasta }

export function login(req, res) {
  const ip = req.ip;
  const reg = intentos.get(ip);
  if (reg && reg.hasta > Date.now()) return res.status(429).json({ error: "Demasiados intentos. Esperá unos minutos." });

  const pass = String(req.body?.password || "");
  const a = Buffer.from(pass), b = Buffer.from(env.adminPassword);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) {
    const n = (reg?.n || 0) + 1;
    intentos.set(ip, { n, hasta: n >= 5 ? Date.now() + 10 * 60 * 1000 : 0 });
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }
  intentos.delete(ip);
  const token = jwt.sign({ rol: "admin" }, env.jwtSecret, { expiresIn: "30d" });
  res.json({ token });
}

export function verificar(_req, res) {
  res.json({ ok: true });
}
