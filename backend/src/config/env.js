import "dotenv/config";

const required = ["MONGODB_URI", "ADMIN_PASSWORD", "JWT_SECRET"];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`Falta la variable de entorno ${k}`);
    process.exit(1);
  }
}

export const env = {
  mongoUri: process.env.MONGODB_URI,
  adminPassword: process.env.ADMIN_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrls: (process.env.FRONTEND_URL || "").split(",").map((s) => s.trim()).filter(Boolean),
  port: Number(process.env.PORT) || 4000,
};
