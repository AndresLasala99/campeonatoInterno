import { useCallback, useEffect, useRef, useState } from "react";
import { api, getToken, setToken, fotoUrl } from "../api.js";
import Encabezado from "../components/Encabezado.jsx";
import Tabla from "../components/Tabla.jsx";
import Modal from "../components/Modal.jsx";
import Avatar from "../components/Avatar.jsx";
import { fmt, diaLabel, sortDias, hoyISO, nuevoId, ptsSemana, total, prepararFoto, prepararEscudo } from "../utils.js";

export default function Admin() {
  const [estado, setEstado] = useState("verificando"); // verificando | login | ok
  useEffect(() => {
    if (!getToken()) return setEstado("login");
    api.verificar().then(() => setEstado("ok")).catch(() => { setToken(null); setEstado("login"); });
  }, []);
  if (estado === "verificando") return <div className="wrap"><div className="state">Cargando…</div></div>;
  if (estado === "login") return <Login onOk={() => setEstado("ok")} />;
  return <Panel onSalir={() => { setToken(null); setEstado("login"); }} />;
}

function Login({ onOk }) {
  const [pass, setPass] = useState(""), [err, setErr] = useState(""), [cargando, setCargando] = useState(false);
  const enviar = async (e) => {
    e.preventDefault(); setErr(""); setCargando(true);
    try { const { token } = await api.login(pass); setToken(token); onOk(); }
    catch (x) { setErr(x.message || "No se pudo entrar"); }
    finally { setCargando(false); }
  };
  return (
    <div className="wrap">
      <form className="login" onSubmit={enviar}>
        <h2>Panel de edición</h2>
        <label className="f">Contraseña</label>
        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoFocus
          style={{ font: "inherit", width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)" }} />
        <div className="err">{err}</div>
        <button className="btn primary" style={{ width: "100%", marginTop: 8 }} disabled={cargando || !pass}>{cargando ? "Entrando…" : "Entrar"}</button>
        <a className="linkpub" href="/">← Ver la tabla pública</a>
      </form>
    </div>
  );
}

function Panel({ onSalir }) {
  const [datos, setDatos] = useState(null);
  const [edWeek, setEdWeek] = useState(null);
  const [modal, setModal] = useState(null); // {tipo, ...}
  const [toast, setToast] = useState("");
  const toastT = useRef();

  const avisar = (m) => { setToast(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(""), 2600); };
  const fallo = useCallback((e) => {
    if (e?.status === 401) { avisar("Se venció la sesión"); setTimeout(onSalir, 1200); }
    else avisar(e?.message || "No se pudo guardar");
  }, [onSalir]);

  const cargar = useCallback(() => api.tabla().then(setDatos).catch(fallo), [fallo]);
  useEffect(() => { cargar(); }, [cargar]);

  if (!datos) return <div className="wrap"><Encabezado datos={null} /><div className="state">Cargando…</div></div>;

  const { semanas, jugadores } = datos;
  const sw = semanas.find((s) => s.id === edWeek) || semanas[semanas.length - 1] || null;
  const lista = [...jugadores].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const guardarSemanas = async (nuevas, extra = {}) => {
    setDatos((d) => ({ ...d, semanas: nuevas, ...extra }));
    try { await api.guardarConfig({ semanas: nuevas, ...extra }); } catch (e) { fallo(e); cargar(); }
  };

  const agregarSemana = () => {
    const s = { id: nuevoId("s"), nombre: "Semana " + (semanas.length + 1), dias: [] };
    setEdWeek(s.id);
    guardarSemanas([...semanas, s]);
  };

  const cambiarPunto = async (j, diaId, raw) => {
    const val = raw.trim() === "" ? 0 : Number(raw.replace(",", "."));
    if (!Number.isFinite(val)) return avisar("Número inválido");
    if ((Number(j.puntos?.[diaId]) || 0) === val && j.puntos?.[diaId] !== undefined) return;
    setDatos((d) => ({ ...d, jugadores: d.jugadores.map((x) => x.id === j.id ? { ...x, puntos: { ...x.puntos, [diaId]: val } } : x) }));
    try { await api.guardarPuntos(j.id, diaId, val); } catch (e) { fallo(e); cargar(); }
  };

  const subirEscudo = async (f) => {
    if (!f) return;
    try { avisar("Subiendo escudo…"); await api.guardarEscudo(await prepararEscudo(f)); await cargar(); avisar("Escudo actualizado"); }
    catch (e) { fallo(e); }
  };

  const importar = async (f) => {
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (data.formato !== "campeonato-juventud") throw new Error("Ese archivo no es una exportación de la tabla");
      setModal({ tipo: "importar", data });
    } catch (e) { avisar(e.message || "Archivo inválido"); }
  };

  return (
    <div className="wrap">
      <Encabezado datos={datos}>
        <a className="btn" href="/" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>👁 Ver pública</a>
        <button className="btn" onClick={onSalir}>Salir</button>
      </Encabezado>

      <div className="editor" style={{ marginTop: 0, marginBottom: 28 }}>
        <div className="ed-top"><h2>Panel de edición</h2>
          <div className="ed-actions">
            <button className="btn small" onClick={agregarSemana}>+ Semana</button>
            {sw && <button className="btn small" onClick={() => setModal({ tipo: "dia", semana: sw, dia: null })}>+ Día</button>}
            <button className="btn small primary" onClick={() => setModal({ tipo: "jugador", jugador: null })}>+ Jugador</button>
          </div>
        </div>

        <label className="f">Título de la tabla</label>
        <div className="title-row">
          <input type="text" maxLength={80} defaultValue={datos.titulo} key={datos.titulo}
            onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== datos.titulo) guardarSemanas(semanas, { titulo: v }); }}
            onKeyDown={(e) => e.key === "Enter" && e.target.blur()} />
        </div>

        <label className="f">Escudo del club</label>
        <div className="title-row" style={{ alignItems: "center", flexWrap: "wrap" }}>
          <label className="btn small" style={{ cursor: "pointer" }}>🛡️ {datos.escudo ? "Cambiar escudo" : "Subir escudo"}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { subirEscudo(e.target.files[0]); e.target.value = ""; }} /></label>
          {datos.escudo && <button className="btn small danger" onClick={async () => { try { await api.guardarEscudo(null); cargar(); } catch (e) { fallo(e); } }}>Quitar</button>}
          <label className="btn small" style={{ cursor: "pointer", marginLeft: "auto" }}>📥 Importar datos
            <input type="file" accept=".json,application/json" style={{ display: "none" }} onChange={(e) => { importar(e.target.files[0]); e.target.value = ""; }} /></label>
        </div>

        {semanas.length > 0 && (<>
          <label className="f">Semana que estás cargando</label>
          <div className="tabs">
            {semanas.map((s) => <button key={s.id} className={"tab " + (s.id === sw?.id ? "on" : "")} onClick={() => setEdWeek(s.id)}>{s.nombre}</button>)}
            {sw && <button className="tab" onClick={() => setModal({ tipo: "semana", semana: sw })}>✎ Renombrar / borrar semana</button>}
          </div>
        </>)}

        {!lista.length ? <div className="state">Agregá el primer jugador con <b>+ Jugador</b>, o importá tus datos.</div>
          : !sw ? <div className="state">Agregá una semana con <b>+ Semana</b> para empezar a cargar puntos.</div>
          : !sw.dias.length ? <div className="state">Esta semana todavía no tiene días. Tocá <b>+ Día</b> para agregar el primero.</div>
          : (<>
            <div className="gridwrap"><table>
              <thead><tr><th className="pl">Jugador</th>
                {sw.dias.map((d) => <th key={d.id} className="wk" title="Cambiar fecha o borrar" onClick={() => setModal({ tipo: "dia", semana: sw, dia: d })}>{diaLabel(d)} ✎</th>)}
                <th>Semana</th><th>General</th></tr></thead>
              <tbody>{lista.map((j) => (
                <tr key={j.id}>
                  <td className="pl"><div className="pin" onClick={() => setModal({ tipo: "jugador", jugador: j })}><Avatar j={j} /><span className="nm">{j.nombre}</span></div></td>
                  {sw.dias.map((d) => (
                    <td key={d.id}><input type="number" step="any" inputMode="decimal" placeholder="0"
                      defaultValue={j.puntos?.[d.id] ?? ""} key={j.id + d.id + (j.puntos?.[d.id] ?? "")}
                      onBlur={(e) => cambiarPunto(j, d.id, e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && e.target.blur()} /></td>
                  ))}
                  <td className="tw">{fmt(ptsSemana(j, sw))}</td>
                  <td className="tot">{fmt(total(j, semanas))}</td>
                </tr>))}
              </tbody></table></div>
            <div className="note">Tocá un jugador para cambiar nombre o foto, o un día para cambiarle la fecha o borrarlo. Los puntos se guardan solos al salir de cada casilla.</div>
          </>)}
      </div>

      <h2 style={{ fontFamily: "Barlow Condensed", textTransform: "uppercase", fontSize: 20, color: "var(--muted)", margin: "0 0 12px" }}>Así la ven los jugadores</h2>
      <Tabla datos={datos} />

      {modal?.tipo === "jugador" && <JugadorModal j={modal.jugador} onClose={() => setModal(null)} onDone={(m) => { setModal(null); cargar(); avisar(m); }} fallo={fallo} />}
      {modal?.tipo === "dia" && <DiaModal semana={modal.semana} dia={modal.dia} onClose={() => setModal(null)}
        onSave={(dias) => { setModal(null); guardarSemanas(semanas.map((s) => s.id === modal.semana.id ? { ...s, dias } : s)); }} />}
      {modal?.tipo === "semana" && <SemanaModal semana={modal.semana} onClose={() => setModal(null)}
        onSave={(nombre) => { setModal(null); guardarSemanas(semanas.map((s) => s.id === modal.semana.id ? { ...s, nombre } : s)); }}
        onDelete={() => { setModal(null); setEdWeek(null); guardarSemanas(semanas.filter((s) => s.id !== modal.semana.id)); }} />}
      {modal?.tipo === "importar" && <ImportarModal data={modal.data} onClose={() => setModal(null)}
        onDone={(m) => { setModal(null); setEdWeek(null); cargar(); avisar(m); }} fallo={fallo} />}

      {toast && <div className="toast" style={{ display: "block" }}>{toast}</div>}
    </div>
  );
}

function Confirmar({ texto, onConfirm }) {
  const [armado, setArmado] = useState(false);
  return <button className="btn danger" onClick={() => (armado ? onConfirm() : setArmado(true))}>{armado ? "¿Seguro? Tocá de nuevo" : texto}</button>;
}

function JugadorModal({ j, onClose, onDone, fallo }) {
  const [nombre, setNombre] = useState(j?.nombre || "");
  const [foto, setFoto] = useState(null);
  const [err, setErr] = useState(""), [guardando, setGuardando] = useState(false);
  const elegir = async (f) => { if (!f) return; try { setFoto(await prepararFoto(f)); setErr(""); } catch { setErr("No se pudo leer esa imagen. Probá con otra."); } };
  const guardar = async () => {
    if (!nombre.trim()) return setErr("Poné un nombre.");
    setGuardando(true);
    try {
      if (j) await api.editarJugador(j.id, { nombre: nombre.trim(), ...(foto ? { foto } : {}) });
      else await api.crearJugador({ nombre: nombre.trim(), foto });
      onDone(j ? "Cambios guardados" : "Jugador agregado");
    } catch (e) { setGuardando(false); setErr(e.message); if (e.status === 401) fallo(e); }
  };
  return (
    <Modal titulo={j ? "Editar jugador" : "Nuevo jugador"} onClose={onClose}>
      <label className="f">Nombre</label>
      <input type="text" maxLength={60} value={nombre} autoFocus placeholder="Ej: Martín Pérez"
        onChange={(e) => setNombre(e.target.value)} onKeyDown={(e) => e.key === "Enter" && guardar()} />
      <div className="photo-pick">
        <Avatar j={j || { nombre: nombre || "?" }} src={foto || (j ? fotoUrl(j) : null)} />
        <div>
          <label className="btn small" style={{ display: "inline-block", cursor: "pointer" }}>📷 {foto || j?.foto ? "Cambiar foto" : "Elegir foto"}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => elegir(e.target.files[0])} /></label>
          <div className="note" style={{ marginTop: 6 }}>Se recorta cuadrada automáticamente.</div>
        </div>
      </div>
      <div className="err">{err}</div>
      <div className="foot">
        {j && <Confirmar texto="Borrar" onConfirm={async () => { try { await api.borrarJugador(j.id); onDone("Jugador borrado"); } catch (e) { setErr(e.message); } }} />}
        <div className="r"><button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn primary" disabled={guardando} onClick={guardar}>{guardando ? "Guardando…" : j ? "Guardar" : "Agregar"}</button></div>
      </div>
    </Modal>
  );
}

function DiaModal({ semana, dia, onClose, onSave }) {
  const [fecha, setFecha] = useState(dia ? dia.fecha || "" : hoyISO());
  const [nombre, setNombre] = useState(dia?.nombre || "");
  const [err, setErr] = useState("");
  const ok = () => {
    if (!fecha && !nombre.trim()) return setErr("Elegí una fecha.");
    if (fecha && !nombre.trim() && semana.dias.some((x) => x.fecha === fecha && x.id !== dia?.id && !x.nombre)) return setErr("Esa fecha ya está en esta semana.");
    const nd = { id: dia ? dia.id : nuevoId("d"), fecha: fecha || null, nombre: nombre.trim() };
    onSave(sortDias(dia ? semana.dias.map((x) => (x.id === dia.id ? nd : x)) : [...semana.dias, nd]));
  };
  return (
    <Modal titulo={`${dia ? "Editar día" : "Agregar día"} · ${semana.nombre}`} onClose={onClose}>
      <label className="f">Fecha</label>
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      <label className="f" style={{ marginTop: 12 }}>Etiqueta (opcional)</label>
      <input type="text" maxLength={30} value={nombre} placeholder="Ej: Doble turno, Amistoso"
        onChange={(e) => setNombre(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ok()} />
      <div className="note">Si no ponés etiqueta, se muestra la fecha (ej: "Jue 19/11").</div>
      <div className="err">{err}</div>
      <div className="foot">
        {dia && <Confirmar texto="Borrar" onConfirm={() => onSave(semana.dias.filter((x) => x.id !== dia.id))} />}
        <div className="r"><button className="btn" onClick={onClose}>Cancelar</button><button className="btn primary" onClick={ok}>{dia ? "Guardar" : "Agregar"}</button></div>
      </div>
    </Modal>
  );
}

function SemanaModal({ semana, onClose, onSave, onDelete }) {
  const [nombre, setNombre] = useState(semana.nombre), [err, setErr] = useState("");
  const ok = () => (nombre.trim() ? onSave(nombre.trim()) : setErr("Poné un nombre."));
  return (
    <Modal titulo="Editar semana" onClose={onClose}>
      <label className="f">Nombre</label>
      <input type="text" maxLength={40} value={nombre} autoFocus onChange={(e) => setNombre(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ok()} />
      <div className="err">{err}</div>
      <div className="foot">
        <Confirmar texto="Borrar semana" onConfirm={onDelete} />
        <div className="r"><button className="btn" onClick={onClose}>Cancelar</button><button className="btn primary" onClick={ok}>Guardar</button></div>
      </div>
    </Modal>
  );
}

function ImportarModal({ data, onClose, onDone, fallo }) {
  const [cargando, setCargando] = useState(false), [err, setErr] = useState("");
  const nf = data.jugadores.filter((j) => j.foto).length;
  const go = async () => {
    setCargando(true);
    try { const r = await api.importar(data); onDone(`Importados ${r.jugadores} jugadores y ${r.semanas} semanas`); }
    catch (e) { setCargando(false); setErr(e.message); if (e.status === 401) fallo(e); }
  };
  return (
    <Modal titulo="Importar datos" onClose={onClose}>
      <p style={{ margin: 0 }}>El archivo tiene <b>{data.jugadores.length} jugadores</b> ({nf} con foto) y <b>{data.config.semanas.length} semanas</b>.</p>
      <p className="note">Esto <b>reemplaza todo</b> lo que haya ahora en la tabla.</p>
      <div className="err">{err}</div>
      <div className="foot"><div className="r">
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn primary" disabled={cargando} onClick={go}>{cargando ? "Importando…" : "Importar"}</button>
      </div></div>
    </Modal>
  );
}
