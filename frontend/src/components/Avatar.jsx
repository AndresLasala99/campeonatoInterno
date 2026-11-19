import { useState } from "react";
import { fotoUrl } from "../api.js";
import { initials } from "../utils.js";

export default function Avatar({ j, className = "av", src }) {
  const [err, setErr] = useState(false);
  const url = src || fotoUrl(j);
  return (
    <div className={className}>
      {url && !err ? <img src={url} alt="" onError={() => setErr(true)} /> : initials(j.nombre)}
    </div>
  );
}
