import mongoose from "mongoose";

const diaSchema = new mongoose.Schema(
  { id: { type: String, required: true }, fecha: { type: String, default: null }, nombre: { type: String, default: "" } },
  { _id: false }
);
const semanaSchema = new mongoose.Schema(
  { id: { type: String, required: true }, nombre: { type: String, required: true }, dias: { type: [diaSchema], default: [] } },
  { _id: false }
);

// Documento único con la configuración del campeonato
const configSchema = new mongoose.Schema(
  {
    clave: { type: String, default: "general", unique: true },
    titulo: { type: String, default: "Campeonato interno - entrenamientos Juventud" },
    semanas: { type: [semanaSchema], default: [] },
    escudo: { data: Buffer, tipo: String },
    escudoVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Config = mongoose.model("Config", configSchema);

export async function getConfig() {
  let c = await Config.findOne({ clave: "general" });
  if (!c) c = await Config.create({ clave: "general" });
  return c;
}
