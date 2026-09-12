import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Users, Truck, CreditCard, AlertTriangle, RefreshCw } from "lucide-react";
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
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async (signal) => {
    setIsLoading(true);
    try {
      const [featRes, regRes] = await Promise.all([
        fetchFeatured({ signal }),
        fetchRegions(),
      ]);

      // Defensive Check & Array Coalescing
      const featuredData = Array.isArray(featRes?.data) ? featRes.data : [];
      const regionsData = Array.isArray(regRes?.data) ? regRes.data : [];

      setFeatured(featuredData.slice(0, 4));
      setRegions(regionsData);

      // Evaluasi apakah respon berasal dari fallback/lokal akibat HTTP 503
      if (featRes?.isFallback || featRes?.source === "local") {
        setIsFallbackMode(true);
      } else {
        setIsFallbackMode(false);
      }
    } catch (err) {
      if (
        err?.name === "AbortError" ||
        err?.name === "CanceledError" ||
        err?.code === "ERR_CANCELED"
      ) {
        return;
      }
      console.error("[Home] Error tidak terduga saat memuat data:", err);
      setIsFallbackMode(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadData]);

  const handleRetry = () => {
    const controller = new AbortController();
    loadData(controller.signal);
  };

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
            {(trustItems ?? []).map((item) => (
              <div key={item?.title ?? Math.random()} className="trust__item">
                <div className="trust__icon">
                  {item?.icon && <item.icon size={20} strokeWidth={1.75} />}
                </div>
                <div>
                  <h3>{item?.title ?? ""}</h3>
                  <p>{item?.desc ?? ""}</p>
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
            {(featured ?? []).map((product) => (
              <ProductCard key={product?.id ?? Math.random()} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--regions">
        <div className="container">
          <SectionTitle title={t("section_regions")} subtitle={t("section_regions_sub")} actionLabel={t("section_see_all")} actionTo="/regions" />
          <div className="region-cards-grid">
            {(regions ?? []).map((region) => (
              <RegionCard key={region?.id ?? Math.random()} region={region} />
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
            {(whyItems ?? []).map((item) => (
              <div key={item?.num ?? Math.random()} className="why__card">
                <div className="why__num">{item?.num ?? ""}</div>
                <h3>{item?.title ?? ""}</h3>
                <p>{item?.desc ?? ""}</p>
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