import { Router } from "express";
import { asyncH } from "../middlewares/errores.js";
import { obtenerTabla, fotoJugador, escudo } from "../controllers/tabla.controller.js";

const r = Router();
r.get("/tabla", asyncH(obtenerTabla));
r.get("/jugadores/:id/foto", asyncH(fotoJugador));
r.get("/escudo", asyncH(escudo));
export default r;
