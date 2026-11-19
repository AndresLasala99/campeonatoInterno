import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import publicRoutes from "./routes/public.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { manejarErrores } from "./middlewares/errores.js";

const app = express();
app.set("trust proxy", 1);
app.use(cors({ origin: env.frontendUrls.length ? env.frontendUrls : true }));
app.use(express.json({ limit: "25mb" })); // el importar trae todas las fotos

app.get("/", (_req, res) => res.json({ ok: true, app: "campeonato-juventud" }));
app.use("/api", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use(manejarErrores);

connectDB()
  .then(() => app.listen(env.port, () => console.log(`API en puerto ${env.port}`)))
  .catch((e) => { console.error("No se pudo conectar a MongoDB", e); process.exit(1); });
