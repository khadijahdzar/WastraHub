import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import "./footer.css";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <img src="/images/logos/wastrahub-logo-footer.png" alt="WastraHub" className="footer__logo-img" />
            </Link>
            <p>{t("footer_tagline")}</p>
            <div className="footer__social">
              <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
            </div>
          </div>

          <div className="footer__col">
            <h4>{t("footer_explore")}</h4>
            <ul>
              <li><Link to="/collections">{t("nav_collections")}</Link></li>
              <li><Link to="/categories">{t("nav_categories")}</Link></li>
              <li><Link to="/regions">{t("nav_regions")}</Link></li>
              <li><Link to="/about">{t("footer_about")}</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>{t("footer_help")}</h4>
            <ul>
              <li><a href="#">{t("footer_faq")}</a></li>
              <li><a href="#">{t("footer_howto")}</a></li>
              <li><a href="#">{t("footer_privacy")}</a></li>
              <li><a href="#">{t("footer_terms")}</a></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>{t("footer_contact")}</h4>
            <ul className="footer__contact">
              <li>
                <MapPin size={16} />
                <span>Jakarta, Indonesia</span>
              </li>
              <li>
                <Mail size={16} />
                <span>hello@wastrahub.id</span>
              </li>
              <li>
                <Phone size={16} />
                <span>+62 812 3456 7890</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} WastraHub. {t("footer_rights")}</p>
        </div>
      </div>
    </footer>
  );
}
