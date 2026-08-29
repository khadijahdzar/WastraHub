import { Link } from "react-router-dom";
import "./region-card.css";

export default function RegionCard({ region, variant = "default" }) {
  const { name, slug, image, count, description } = region;

  if (variant === "pill") {
    return (
      <Link to={`/regions/${slug}`} className="region-pill">
        <div className="region-pill__image">
          <img src={image || "/images/regions/placeholder.jpg"} alt={name} />
        </div>
        <span className="region-pill__name">{name}</span>
      </Link>
    );
  }

  return (
    <Link to={`/regions/${slug}`} className="region-card">
      <div className="region-card__image">
        <img src={image || "/images/regions/placeholder.jpg"} alt={name} />
        <div className="region-card__overlay" />
      </div>
      <div className="region-card__content">
        <h3>{name}</h3>
        {description && <p>{description}</p>}
        {count !== undefined && (
          <span className="region-card__count">{count} koleksi</span>
        )}
      </div>
    </Link>
  );
}
