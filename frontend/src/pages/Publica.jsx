import { useEffect, useState } from "react";
import { api } from "../api.js";
import Encabezado from "../components/Encabezado.jsx";
import Tabla from "../components/Tabla.jsx";

export default function Publica() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [lento, setLento] = useState(false);

  useEffect(() => {
    let vivo = true;
    const t = setTimeout(() => vivo && setLento(true), 6000);
    const cargar = () => api.tabla()
      .then((d) => { if (vivo) { setDatos(d); setError(null); document.title = d.titulo; } })
      .catch(() => vivo && setError("No se pudo cargar la tabla. Probá de nuevo en un rato."));
    cargar();
    const iv = setInterval(() => document.visibilityState === "visible" && cargar(), 30000);
    const vis = () => document.visibilityState === "visible" && cargar();
    document.addEventListener("visibilitychange", vis);
    return () => { vivo = false; clearTimeout(t); clearInterval(iv); document.removeEventListener("visibilitychange", vis); };
  }, []);

  return (
    <div className="wrap">
      <Encabezado datos={datos} />
      {datos ? <Tabla datos={datos} /> :
        error && !datos ? <div className="state">{error}</div> :
        <div className="state">Cargando tabla…{lento && <div className="note">El servidor se está despertando, puede tardar unos segundos.</div>}</div>}
      {datos && <div className="upd">Se actualiza sola cada 30 segundos</div>}
    </div>
  );
}
