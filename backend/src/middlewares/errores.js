export function manejarErrores(err, req, res, _next) {
  console.error(err);
  const status = err.status || (err.name === "ValidationError" || err.name === "CastError" ? 400 : 500);
  res.status(status).json({ error: status === 500 ? "Error del servidor" : err.message });
}

export const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
