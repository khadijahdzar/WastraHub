import { useSearchParams, Link } from "react-router-dom";
import { useMemo } from "react";
import ProductCard from "../components/card/ProductCard";
import { filterProducts } from "../data/products";
import { useLanguage } from "../context/LanguageContext";
import "./search.css";

export default function SearchResult() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const results = useMemo(() => filterProducts({ search: q }), [q]);
  const { t } = useLanguage();

  return (
    <div className="search-page">
      <div className="container">
        <h1>
          {t("search_results")}{" "}
          {q && (
            <span>
              {t("search_for")} “{q}”
            </span>
          )}
        </h1>
        <p className="search-count">
          {results.length} {t("collections_found")}
        </p>
        {results.length === 0 ? (
          <div className="search-empty">
            <p>{t("search_empty")}</p>
            <Link to="/collections">{t("search_see_all")}</Link>
          </div>
        ) : (
          <div className="product-grid product-grid--search">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
