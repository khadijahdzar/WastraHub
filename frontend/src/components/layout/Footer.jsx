import { Link } from "react-router-dom";
import { Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import "./footer.css";

/** Ganti URL berikut dengan akun resmi WastraHub */
const SOCIAL = {
  instagram: "https://instagram.com/khadijahdzar",
  linkedin: "https://www.linkedin.com/in/khadijah-dzar-990355405",
};

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <img
                src="/images/logos/wastrahub-logo-footer.png"
                alt="WastraHub"
                className="footer__logo-img"
              />
            </Link>
            <p>{t("footer_tagline")}</p>
            <div className="footer__social">
              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href={SOCIAL.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div className="footer__col">
            <h4>{t("footer_explore")}</h4>
            <ul>
              <li>
                <Link to="/collections">{t("nav_collections")}</Link>
              </li>
              <li>
                <Link to="/categories">{t("nav_categories")}</Link>
              </li>
              <li>
                <Link to="/regions">{t("nav_regions")}</Link>
              </li>
              <li>
                <Link to="/about">{t("footer_about")}</Link>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>{t("footer_help")}</h4>
            <ul>
              <li>
                <a href="#">{t("footer_faq")}</a>
              </li>
              <li>
                <a href="#">{t("footer_howto")}</a>
              </li>
              <li>
                <a href="#">{t("footer_privacy")}</a>
              </li>
              <li>
                <a href="#">{t("footer_terms")}</a>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>{t("footer_contact")}</h4>
            <ul className="footer__contact">
              <li>
                <MapPin size={16} />
                <span>Pati, Jawa Tengah</span>
              </li>
              <li>
                <Mail size={16} />
                <span>khadijahdzar2509@gmail.com</span>
              </li>
              <li>
                <Phone size={16} />
                <span>+62 821 3400 8512</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>
            © {new Date().getFullYear()} WastraHub. {t("footer_rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}