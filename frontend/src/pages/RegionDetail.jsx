import { useParams, Link, Navigate } from "react-router-dom";
import { useMemo } from "react";
import ProductCard from "../components/card/ProductCard";
import { regions, filterProducts } from "../data/products";
import { useLanguage } from "../context/LanguageContext";
import "./region-detail.css";

const REGION_MAP = {
  yogyakarta: { bbox: "110.25%2C-8.05%2C110.55%2C-7.65", marker: "-7.7956%2C110.3695" },
  solo: { bbox: "110.70%2C-7.65%2C110.95%2C-7.45", marker: "-7.5755%2C110.8243" },
  pekalongan: { bbox: "109.55%2C-6.95%2C109.80%2C-6.75", marker: "-6.8886%2C109.6753" },
  cirebon: { bbox: "108.45%2C-6.80%2C108.70%2C-6.60", marker: "-6.7320%2C108.5523" },
  lasem: { bbox: "111.35%2C-6.75%2C111.55%2C-6.55", marker: "-6.6922%2C111.4520" },
  madura: { bbox: "112.90%2C-7.30%2C114.20%2C-6.80", marker: "-7.0500%2C113.5000" },
  banten: { bbox: "105.90%2C-6.50%2C106.40%2C-5.90", marker: "-6.1200%2C106.1500" },
  bali: { bbox: "114.90%2C-8.90%2C115.70%2C-8.20", marker: "-8.4095%2C115.1889" },
  bakaran: { bbox: "110.95%2C-6.80%2C111.20%2C-6.55", marker: "-6.7000%2C111.1000" },
};

export default function RegionDetail() {
  const { slug } = useParams();
  const { t } = useLanguage();

  if (slug && /^\d+$/.test(slug)) {
    return <Navigate to={`/product/${slug}`} replace />;
  }

  const region = useMemo(
    () => regions.find((r) => r.slug === slug),
    [slug]
  );

  const regionProducts = useMemo(() => {
    if (!region) return [];
    return filterProducts({ region: region.name });
  }, [region]);

  if (!region) {
    return (
      <div className="region-detail region-detail--empty">
        <div className="container">
          <h1>{t("region_not_found")}</h1>
          <p>{t("region_not_found_desc")}</p>
          <Link to="/regions" className="region-detail__back">
            ← {t("region_back")}
          </Link>
        </div>
      </div>
    );
  }

  const mapCfg = REGION_MAP[region.slug] || REGION_MAP.yogyakarta;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${mapCfg.bbox}&layer=mapnik&marker=${mapCfg.marker}`;

  return (
    <div className="region-detail">
      <div className="region-detail__hero">
        <div className="region-detail__hero-bg">
          <img
            src={region.image || "/images/regions/placeholder.jpg"}
            alt={region.name}
          />
          <div className="region-detail__hero-overlay" />
        </div>
        <div className="container region-detail__hero-content">
          <nav className="region-detail__breadcrumb">
            <Link to="/">{t("region_breadcrumb_home")}</Link>
            <span>/</span>
            <Link to="/regions">{t("region_breadcrumb_regions")}</Link>
            <span>/</span>
            <span>{region.name}</span>
          </nav>
          <h1>Batik {region.name}</h1>
          <p className="region-detail__desc">{region.description}</p>
          <span className="region-detail__count">
            {regionProducts.length > 0
              ? `${regionProducts.length} ${t("region_available")}`
              : `${region.count || 0} ${t("regions_collections")}`}
          </span>
        </div>
      </div>

      <div className="container region-detail__body">
        <section className="region-detail__map-section">
          <h2 className="region-detail__map-title">{t("region_map")}</h2>
          <div className="region-detail__map-wrap">
            <iframe
              title={`${t("region_map")} — ${region.name}`}
              src={mapSrc}
              className="region-detail__map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        {regionProducts.length === 0 ? (
          <div className="region-detail__empty">
            <p>
              {t("region_empty")}{" "}
              <strong>{region.name}</strong>
            </p>
            <Link to="/collections" className="region-detail__back">
              {t("section_see_all")} →
            </Link>
          </div>
        ) : (
          <>
            <div className="region-detail__toolbar">
              <h2>
                {t("nav_collections")} — {region.name}
              </h2>
              <span>
                {regionProducts.length} {t("region_products")}
              </span>
            </div>
            <div className="product-grid product-grid--region">
              {regionProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
