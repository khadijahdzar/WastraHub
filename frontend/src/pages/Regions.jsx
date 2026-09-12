import { Link } from "react-router-dom";
import { regions } from "../data/products";
import Button from "../components/common/Button";
import { useLanguage } from "../context/LanguageContext";
import "./regions.css";

const jawaTengahCities = ["pekalongan", "solo", "lasem", "bakaran"];

const otherRegionsId = [
  {
    id: "yogyakarta",
    name: "Daerah Istimewa Yogyakarta",
    nameEn: "Special Region of Yogyakarta",
    slug: "yogyakarta",
    description:
      "Batik klasik keraton dengan filosofi mendalam. Motif parang, kawung, dan truntum menjadi ikon budaya.",
    descriptionEn:
      "Classic palace batik with deep philosophy. Parang, kawung, and truntum motifs are cultural icons.",
    image: "/images/regions/yogyakarta.jpg",
  },
  {
    id: "cirebon",
    name: "Jawa Barat (Cirebon)",
    nameEn: "West Java (Cirebon)",
    slug: "cirebon",
    description:
      "Pengaruh pesisir: motif Mega Mendung (awan) yang memadukan pengaruh Tionghoa dan lokal.",
    descriptionEn:
      "Coastal influence: Mega Mendung (cloud) motifs blending Chinese and local styles.",
    image: "/images/regions/cirebon.jpg",
  },
  {
    id: "madura",
    name: "Jawa Timur (Madura)",
    nameEn: "East Java (Madura)",
    slug: "madura",
    description:
      "Bold & vibrant: garis tegas dan warna cerah yang mencerminkan semangat pulau Madura.",
    descriptionEn:
      "Bold and vibrant: strong lines and bright colors reflecting the spirit of Madura island.",
    image: "/images/regions/madura.jpg",
  },
];

export default function Regions() {
  const { t, lang } = useLanguage();
  const featuredCities = regions.filter((r) => jawaTengahCities.includes(r.slug));

  const scrollToAll = () => {
    document.getElementById("semua-sentra")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="regions-page">
      <div className="regions-page__inner">
        <header className="regions-page__header">
          <h1>{t("regions_title")}</h1>
          <p>{t("regions_subtitle")}</p>
        </header>

        <section className="regions-featured" aria-labelledby="featured-heading">
          <div className="regions-featured__content">
            <span className="regions-featured__label">{t("regions_spotlight")}</span>
            <h2 id="featured-heading">{t("regions_jateng_title")}</h2>
            <p>{t("regions_jateng_desc")}</p>

            <div className="regions-featured__chips" id="sentra-jateng">
              {featuredCities.map((city) => (
                <Link key={city.slug} to={`/regions/${city.slug}`} className="regions-chip">
                  {city.name}
                </Link>
              ))}
            </div>

            <Button
              variant="primary"
              size="lg"
              type="button"
              className="regions-featured__cta-btn"
              onClick={scrollToAll}
            >
              {t("regions_see_all")}
            </Button>
          </div>

          <div className="regions-featured__map">
            <div className="regions-featured__map-frame">
              <iframe
                title={t("map_title") || "Peta Sentra Batik Jawa Tengah"}
                className="regions-map-iframe"
                src="https://www.openstreetmap.org/export/embed.html?bbox=108.8%2C-7.8%2C111.6%2C-6.5&layer=mapnik&marker=-7.0%2C110.4"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <p className="regions-featured__map-caption">
              {lang === "en" ? "Central Java batik centers" : "Sentra batik Jawa Tengah"}
            </p>
          </div>
        </section>

        <section className="regions-grid-section">
          <h3 className="regions-grid-section__title">{t("regions_other")}</h3>
          <div className="regions-cards">
            {otherRegionsId.map((r) => (
              <article key={r.id} className="regions-card">
                <div className="regions-card__media">
                  <img
                    src={r.image}
                    alt={lang === "en" ? r.nameEn : r.name}
                    onError={(e) => {
                      e.currentTarget.src = "/images/regions/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="regions-card__body">
                  <h4>{lang === "en" ? r.nameEn : r.name}</h4>
                  <p>{lang === "en" ? r.descriptionEn : r.description}</p>
                  <Link to={`/regions/${r.slug}`} className="regions-card__btn">
                    {t("regions_explore_btn")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="regions-all" id="semua-sentra">
          <h3 className="regions-grid-section__title">{t("regions_all")}</h3>
          <div className="regions-all__grid">
            {regions.map((r) => (
              <Link key={r.id} to={`/regions/${r.slug}`} className="regions-all__item">
                <div className="regions-all__thumb">
                  <img
                    src={r.image || "/images/regions/placeholder.jpg"}
                    alt={r.name}
                    onError={(e) => {
                      e.currentTarget.src = "/images/regions/placeholder.jpg";
                    }}
                  />
                </div>
                <div>
                  <strong>{r.name}</strong>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
