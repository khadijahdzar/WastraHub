import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./navbar.css";

const navLinks = [
  { to: "/", labelKey: "nav_home", end: true },
  { to: "/collections", labelKey: "nav_collections" },
  { to: "/categories", labelKey: "nav_categories" },
  { to: "/regions", labelKey: "nav_regions" },
  { to: "/orders", labelKey: "nav_orders" },
];

export default function Navbar({ cartCount = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery("");
    setMobileOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" onClick={() => setMobileOpen(false)}>
          <img
            src="/images/logos/wastrahub-logo-nav.png"
            alt="WastraHub"
            className="navbar__logo-img"
          />
        </Link>

        <nav className="navbar__links" aria-label="Navigasi utama">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `navbar__link ${isActive ? "is-active" : ""}`
              }
            >
              {t(link.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          <button
            type="button"
            className="navbar__icon-btn"
            aria-label={t("nav_search")}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((v) => !v);
              setMobileOpen(false);
            }}
          >
            <Search size={20} strokeWidth={1.75} />
          </button>

          <Link
            to="/cart"
            className="navbar__icon-btn navbar__cart"
            aria-label={cartCount > 0 ? `Keranjang, ${cartCount} item` : "Keranjang"}
            data-cart-icon
          >
            <ShoppingBag size={20} strokeWidth={1.75} />
            {cartCount > 0 && (
              <span className="navbar__cart-badge">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <Link
            to={isAuthenticated ? "/profile" : "/login"}
            className="navbar__icon-btn"
            aria-label={isAuthenticated ? t("nav_profile") : t("nav_login")}
          >
            <User size={20} strokeWidth={1.75} />
          </Link>

          <div className="navbar__lang" role="group" aria-label={t("language")}>
            <button
              type="button"
              className={`navbar__lang-btn ${lang === "id" ? "is-active" : ""}`}
              onClick={() => setLang("id")}
            >
              ID
            </button>
            <button
              type="button"
              className={`navbar__lang-btn ${lang === "en" ? "is-active" : ""}`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            className="navbar__icon-btn navbar__menu-btn"
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileOpen((v) => !v);
              setSearchOpen(false);
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="navbar__search">
          <form onSubmit={handleSearch} className="navbar__search-form">
            <Search size={18} strokeWidth={1.75} aria-hidden />
            <input
              type="search"
              placeholder={t("nav_search_placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              aria-label="Kata kunci pencarian"
            />
            <button type="submit">Cari</button>
          </form>
        </div>
      )}

      {mobileOpen && (
        <div className="navbar__mobile" role="dialog" aria-label="Menu navigasi">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `navbar__mobile-link ${isActive ? "is-active" : ""}`
              }
              onClick={() => setMobileOpen(false)}
            >
              {t(link.labelKey)}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}