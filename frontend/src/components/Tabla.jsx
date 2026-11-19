import { useState } from "react";
import Avatar from "./Avatar.jsx";
import { ranking, fmt, diaLabel, ptsDia, ptsSemana, total } from "../utils.js";

export default function Tabla({ datos }) {
  const [vista, setVista] = useState({ semana: null, dia: null });
  const { semanas, jugadores } = datos;

  const sem = vista.semana ? semanas.find((s) => s.id === vista.semana) : null;
  const v = sem ? { semana: sem.id, dia: sem.dias.some((d) => d.id === vista.dia) ? vista.dia : null } : { semana: null, dia: null };

  if (!jugadores.length) return <div className="state">Todavía no hay jugadores en la tabla.</div>;

  const r = ranking(jugadores, semanas, v);
  const top = r.filter((x) => x.s > 0).slice(0, 3);
  const ultimaSem = semanas[semanas.length - 1];
  const ultimoDia = sem && sem.dias[sem.dias.length - 1];

  const sub = (j) => {
    if (!sem && ultimaSem) {
      const u = ptsSemana(j, ultimaSem);
      return <div className="sub">{ultimaSem.nombre}: <span className={u > 0 ? "up" : ""}>{u > 0 ? "+" : ""}{fmt(u)}</span></div>;
    }
    if (sem && !v.dia) {
      if (!ultimoDia) return <div className="sub">General: {fmt(total(j, semanas))}</div>;
      const u = ptsDia(j, ultimoDia.id);
      return <div className="sub">{diaLabel(ultimoDia)}: <span className={u > 0 ? "up" : ""}>{u > 0 ? "+" : ""}{fmt(u)}</span> · General: {fmt(total(j, semanas))}</div>;
    }
    if (v.dia) return <div className="sub">Semana: {fmt(ptsSemana(j, sem))} · General: {fmt(total(j, semanas))}</div>;
    return null;
  };

  const Pod = ({ x, cls, c }) => x ? (
    <div className={"pod " + cls} style={{ "--c": c }}>
      <Avatar j={x.j} className="ph" />
      <div className="nm">{x.j.nombre}</div>
      <div className="pts">{fmt(x.s)} pts</div>
      <div className="block">{x.pos}</div>
    </div>
  ) : <div />;

  return (
    <>
      <div className="tabs">
        <button className={"tab " + (!sem ? "on" : "")} onClick={() => setVista({ semana: null, dia: null })}>General</button>
        {semanas.map((s) => (
          <button key={s.id} className={"tab " + (sem?.id === s.id ? "on" : "")} onClick={() => setVista({ semana: s.id, dia: null })}>{s.nombre}</button>
        ))}
      </div>
      {sem && sem.dias.length > 0 && (
        <div className="tabs sub">
          <button className={"tab " + (!v.dia ? "on" : "")} onClick={() => setVista({ semana: sem.id, dia: null })}>Toda la semana</button>
          {sem.dias.map((d) => (
            <button key={d.id} className={"tab " + (v.dia === d.id ? "on" : "")} onClick={() => setVista({ semana: sem.id, dia: d.id })}>{diaLabel(d)}</button>
          ))}
        </div>
      )}

      {top.length > 0 && (
        <div className="podium">
          <Pod x={top[1]} cls="second" c="var(--silver)" />
          <Pod x={top[0]} cls="first" c="var(--gold)" />
          <Pod x={top[2]} cls="third" c="var(--bronze)" />
        </div>
      )}

      <div className="list">
        {r.map((x) => (
          <div key={x.j.id} className={"row p" + x.pos}>
            <div className="pos">{x.pos}</div>
            <Avatar j={x.j} />
            <div style={{ minWidth: 0 }}><div className="name">{x.j.nombre}</div>{sub(x.j)}</div>
            <div className="score">{fmt(x.s)}<small>pts</small></div>
          </div>
        ))}
      </div>
    </>
  );
}
