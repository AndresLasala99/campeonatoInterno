import mongoose from "mongoose";

const jugadorSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 60 },
    foto: { data: Buffer, tipo: String },
    fotoVersion: { type: Number, default: 0 },
    // puntos por día: { idDelDia: número }
    puntos: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

export const Jugador = mongoose.model("Jugador", jugadorSchema);
