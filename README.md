# Campeonato interno – entrenamientos Juventud

Tabla de posiciones con **link público sin login** para los jugadores y un **panel de edición con contraseña** para vos.

- `https://TU-APP.vercel.app` → la tabla pública. Los jugadores solo la ven, no pueden tocar nada. Se actualiza sola cada 30 segundos.
- `https://TU-APP.vercel.app/admin` → el panel. Pide contraseña.

Usa la misma arquitectura que tus otras apps: **Express + MongoDB (backend en Render)** y **React + Vite (frontend en Vercel)**, todo en un solo repo.

```
campeonato-juventud/
├── backend/   → API (Render)
└── frontend/  → página (Vercel)
```

---

## 1. Base de datos (MongoDB Atlas)

Usá una base **nueva** para no mezclar datos con las otras apps. Alcanza con cambiar el nombre al final de la URI:

```
mongodb+srv://USUARIO:CLAVE@cluster0.xxxxx.mongodb.net/campeonato-juventud
```

En Atlas, en **Network Access**, tiene que estar permitido `0.0.0.0/0`, igual que en las otras apps.

## 2. Backend en Render

1. Subí el repo a GitHub.
2. En Render: **New → Web Service** y elegí el repo.
3. Configuración:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Variables de entorno (**Environment**):

| Variable | Qué poner |
|---|---|
| `MONGODB_URI` | La URI del paso 1 |
| `ADMIN_PASSWORD` | La contraseña para entrar a /admin. Elegí una que no uses en otro lado. |
| `JWT_SECRET` | Cualquier texto largo y al azar (sirve para firmar las sesiones) |
| `FRONTEND_URL` | La URL de Vercel, por ejemplo `https://campeonato-juventud.vercel.app`. La completás después del paso 3. |

5. Cuando termina, abrí la URL de Render (por ejemplo `https://campeonato-juventud-api.onrender.com`). Tiene que mostrar `{"ok":true,...}`.

## 3. Frontend en Vercel

1. En Vercel: **Add New → Project** y elegí el mismo repo.
2. **Root Directory:** `frontend`. Vercel detecta Vite solo.
3. Variable de entorno:
   - `VITE_API_URL` = la URL de Render, **sin barra al final**.
4. Deploy.
5. Volvé a Render, poné la URL de Vercel en `FRONTEND_URL` y guardá. Render se reinicia solo.

## 4. Pasar los datos que ya cargaste

1. Abrí la tabla vieja en Claude y tocá **⬇️ Exportar datos**. Baja el archivo `campeonato-juventud-datos.json`, con jugadores, fotos, semanas, días y puntos.
2. Entrá a `https://TU-APP.vercel.app/admin` con tu contraseña.
3. Tocá **📥 Importar datos** y elegí ese archivo.

Listo. A partir de ahí cargás todo desde /admin.

## 5. Mandarlo a los jugadores

Mandá **solo** el link principal (`https://TU-APP.vercel.app`), sin `/admin`. Aunque alguien entrara a /admin, sin la contraseña no puede editar nada. Eso lo controla el servidor.

---

## Cómo se usa el panel

- **+ Jugador**: nombre y foto. La foto se recorta cuadrada sola.
- **+ Semana**: crea la semana siguiente.
- **+ Día**: le agrega un día a la semana elegida, con su fecha.
- En la grilla cargás los puntos de cada jugador en cada día. Se guardan al salir de la casilla. Las columnas **Semana** y **General** suman solas.
- Tocando un jugador cambiás nombre o foto, o lo borrás. Tocando un día le cambiás la fecha o lo borrás.
- Abajo del panel ves la tabla tal como la ven los jugadores.

## Cosas a saber

- **Render gratis se "duerme"** después de 15 minutos sin uso. La primera persona que abra la tabla puede esperar unos 30 a 50 segundos. Después anda rápido. Si molesta, se soluciona con el plan pago de Render o con un ping periódico.
- Las fotos se guardan dentro de MongoDB, achicadas a 400×400, unos 30–40 KB cada una. Con un plantel entero no llega ni a 2 MB.
- La sesión del panel dura 30 días en ese navegador. Con 5 contraseñas mal seguidas, bloquea los intentos por 10 minutos.

## Probar en tu compu

```bash
cd backend  && cp .env.example .env   # completá los datos
npm install && npm run dev            # API en http://localhost:4000

cd frontend && npm install && npm run dev   # página en http://localhost:5173
```
