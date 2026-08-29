import { Link } from "react-router-dom";
import "./section-title.css";

export default function SectionTitle({ title, subtitle, actionLabel, actionTo, align = "left" }) {
  return (
    <div className={`section-title section-title--${align}`}>
      <div className="section-title__text">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="section-title__action">
          {actionLabel}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}
