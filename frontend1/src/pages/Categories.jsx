import { Link } from "react-router-dom";
import { categories } from "../data/products";
import { useLanguage } from "../context/LanguageContext";
import "./categories.css";

export default function Categories() {
  const { t } = useLanguage();

  return (
    <div className="categories-page">
      <div className="categories-page__header">
        <div className="container">
          <h1>{t("categories_title")}</h1>
          <p>{t("categories_sub")}</p>
        </div>
      </div>
      <div className="container categories-page__grid">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/collections?category=${cat.slug}`}
            className="category-card"
          >
            <div className="category-card__image">
              <img
                src={cat.image || "/images/categories/placeholder.jpg"}
                alt={cat.name}
              />
            </div>
            <div className="category-card__body">
              <h3>{cat.name}</h3>
              {cat.description && (
                <p className="category-card__desc">{cat.description}</p>
              )}
              <span>
                {cat.count} {t("region_products")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
