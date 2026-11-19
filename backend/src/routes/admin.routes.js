import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.js";
import { asyncH } from "../middlewares/errores.js";
import * as c from "../controllers/admin.controller.js";

const r = Router();
r.use(requireAdmin);
r.put("/config", asyncH(c.guardarConfig));
r.put("/escudo", asyncH(c.guardarEscudo));
r.post("/jugadores", asyncH(c.crearJugador));
r.put("/jugadores/:id", asyncH(c.editarJugador));
r.delete("/jugadores/:id", asyncH(c.borrarJugador));
r.put("/jugadores/:id/puntos", asyncH(c.guardarPuntos));
r.post("/importar", asyncH(c.importar));
export default r;
