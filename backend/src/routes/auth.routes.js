import { Router } from "express";
import { login, verificar } from "../controllers/auth.controller.js";
import { requireAdmin } from "../middlewares/auth.js";

const r = Router();
r.post("/login", login);
r.get("/verificar", requireAdmin, verificar);
export default r;
