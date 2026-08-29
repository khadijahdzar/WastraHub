import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Users, Truck, CreditCard } from "lucide-react";
import ProductCard from "../components/card/ProductCard";
import RegionCard from "../components/card/RegionCard";
import SectionTitle from "../components/common/SectionTitle";
import Button from "../components/common/Button";
import { fetchFeatured, fetchRegions } from "../services/productService";
import { useLanguage } from "../context/LanguageContext";
import "./home.css";

export default function Home() {
  const { t, lang } = useLanguage();
  const [featured, setFeatured] = useState([]);
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [featRes, regRes] = await Promise.all([fetchFeatured(), fetchRegions()]);
      if (!cancelled) {
        setFeatured((featRes.data || []).slice(0, 4));
        setRegions(regRes.data || []);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const trustItems = [
    { icon: ShieldCheck, title: t("trust_authentic"), desc: t("trust_authentic_desc") },
    { icon: Users, title: t("trust_artisans"), desc: t("trust_artisans_desc") },
    { icon: Truck, title: t("trust_shipping"), desc: t("trust_shipping_desc") },
    { icon: CreditCard, title: t("trust_payment"), desc: t("trust_payment_desc") },
  ];

  const whyItems = [
    { num: "01", title: t("why_1_title"), desc: t("why_1_desc") },
    { num: "02", title: t("why_2_title"), desc: t("why_2_desc") },
    { num: "03", title: t("why_3_title"), desc: t("why_3_desc") },
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__container">
          <div className="hero__content">
            <h1>
              {t("hero_title_1")}
              <br />
              <span>{t("hero_title_2")}</span>
            </h1>
            <p>{t("hero_desc")}</p>
            <div className="hero__actions">
              <Link to="/collections">
                <Button variant="primary" size="lg">{t("hero_shop")}</Button>
              </Link>
              <Link to="/collections">
                <Button variant="outline" size="lg">{t("hero_explore")}</Button>
              </Link>
            </div>
          </div>
          <div className="hero__visual">
            <img
              src="/images/hero-batik.png"
              alt={lang === "en" ? "WastraHub Premium Batik Collection" : "Koleksi Batik Premium WastraHub"}
              className="hero__image"
            />
          </div>
        </div>
        <div className="trust">
          <div className="trust__container">
            {trustItems.map((item) => (
              <div key={item.title} className="trust__item">
                <div className="trust__icon">
                  <item.icon size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <SectionTitle title={t("section_featured")} actionLabel={t("section_see_all")} actionTo="/collections" />
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--regions">
        <div className="container">
          <SectionTitle title={t("section_regions")} subtitle={t("section_regions_sub")} actionLabel={t("section_see_all")} actionTo="/regions" />
          <div className="region-cards-grid">
            {regions.map((region) => (
              <RegionCard key={region.id} region={region} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-section why">
        <div className="container">
          <SectionTitle
            title={t("why_title")}
            subtitle={t("why_sub")}
            align="center"
          />
          <div className="why__grid">
            {whyItems.map((item) => (
              <div key={item.num} className="why__card">
                <div className="why__num">{item.num}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta__container">
          <h2>{t("section_cta_title")}</h2>
          <p>{t("section_cta_desc")}</p>
          <Link to="/collections">
            <Button variant="secondary" size="lg">{t("hero_shop")}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
