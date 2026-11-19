import { escudoUrl } from "../api.js";

export default function Encabezado({ datos, children }) {
  const n = datos?.semanas.length || 0, nj = datos?.jugadores.length || 0;
  const esc = escudoUrl(datos?.escudo);
  return (
    <>
      <div className="stripe" />
      <header>
        <div className="brand">
          {esc && <img className="crest" src={esc} alt="" />}
          <div>
            <div className="kicker">Club Atlético Juventud · Ranking de ejercicios</div>
            <h1>{datos?.titulo || "Tabla de posiciones"}</h1>
            {datos && <div className="meta">{nj} jugador{nj === 1 ? "" : "es"} · {n} semana{n === 1 ? "" : "s"}</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</div>
      </header>
    </>
  );
}
