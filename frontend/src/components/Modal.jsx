import { useEffect } from "react";

export default function Modal({ titulo, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="mask on" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal"><h3>{titulo}</h3>{children}</div>
    </div>
  );
}
