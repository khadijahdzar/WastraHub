import { useLanguage } from "../context/LanguageContext";
import "./about.css";

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1>{t("about_title")}</h1>
          <p>{t("about_intro")}</p>
        </div>
      </div>

      <div className="container about-content">
        <section>
          <h2>{t("about_history")}</h2>
          <p>{t("about_history_p1")}</p>
          <p>{t("about_history_p2")}</p>
        </section>

        <section>
          <h2>{t("about_types")}</h2>
          <div className="about-types">
            <div className="about-type">
              <h3>{t("about_tulis")}</h3>
              <p>{t("about_tulis_desc")}</p>
            </div>
            <div className="about-type">
              <h3>{t("about_cap")}</h3>
              <p>{t("about_cap_desc")}</p>
            </div>
            <div className="about-type">
              <h3>{t("about_kombi")}</h3>
              <p>{t("about_kombi_desc")}</p>
            </div>
            <div className="about-type">
              <h3>{t("about_print")}</h3>
              <p>{t("about_print_desc")}</p>
            </div>
          </div>
        </section>

        <section>
          <h2>{t("about_preserve")}</h2>
          <p>{t("about_preserve_p")}</p>
        </section>
      </div>
    </div>
  );
}
