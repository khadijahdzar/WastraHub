import { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import "./toast.css";

export default function Toast({ open, message, type = "success", onClose, duration = 3500 }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className={`wh-toast wh-toast--${type}`} role="status" aria-live="polite">
      <span className="wh-toast__icon">
        {type === "success" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
      </span>
      <p className="wh-toast__msg">{message}</p>
      <button type="button" className="wh-toast__close" onClick={onClose} aria-label="Tutup">
        <X size={16} />
      </button>
    </div>
  );
}