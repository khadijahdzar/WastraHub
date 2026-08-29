import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, MessageSquare, BarChart3, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import "./admin.css";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const NAV = [
    { to: "/admin", end: true, label: t("admin_dashboard"), icon: LayoutDashboard },
    { to: "/admin/products", label: t("admin_products"), icon: Package },
    { to: "/admin/orders", label: t("admin_orders"), icon: ShoppingBag },
    { to: "/admin/reviews", label: t("admin_reviews"), icon: MessageSquare },
    { to: "/admin/reports", label: t("admin_reports"), icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-shell">
      <div className={`admin-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="admin-sidebar__brand">
          <a href="/"><img src="/images/logos/wastrahub-logo-nav.png" alt="WastraHub" className="admin-sidebar__logo-img" /></a>
          <p>Admin</p>
        </div>
        <nav className="admin-sidebar__nav">
          {NAV.map(({ to, end, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `admin-sidebar__link ${isActive ? "active" : ""}`} onClick={() => setOpen(false)}>
              <Icon strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <p className="admin-name">{user?.name || "Admin"}</p>
          <button type="button" className="admin-sidebar__logout" onClick={handleLogout}>
            <LogOut size={18} /> {t("admin_logout")}
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" className="admin-menu-btn" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
            <h1 className="font-display">{NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label || "Admin"}</h1>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
