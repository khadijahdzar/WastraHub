import { useState, useEffect, useCallback } from "react";
import { NavLink, Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { clearAdminSession, getAdminSession } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { adminFetchOrders } from "../services/adminService";
import "./admin.css";

function readLocalNotifs() {
  try {
    return JSON.parse(localStorage.getItem("wastrahub_admin_notifs") || "[]");
  } catch {
    return [];
  }
}

export default function AdminLayout() {
  const user = getAdminSession();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(() => readLocalNotifs());
  const [needShipCount, setNeedShipCount] = useState(0);

  const refreshNotifs = useCallback(() => {
    setNotifs(readLocalNotifs());
  }, []);

  const pollPaidOrders = useCallback(async () => {
    try {
      const res = await adminFetchOrders();
      const list = res.data || [];
      const paid = list.filter((o) =>
        ["paid", "processing"].includes(String(o.status || "").toLowerCase())
      );
      setNeedShipCount(paid.length);

      if (paid.length) {
        const existing = readLocalNotifs();
        let changed = false;
        for (const o of paid) {
          const key = String(o.id);
          if (!existing.some((n) => String(n.order_id) === key && n.type === "order_paid")) {
            existing.unshift({
              id: Date.now() + Math.random(),
              type: "order_paid",
              order_id: o.id,
              order_number: o.order_number,
              message: `Pesanan ${o.order_number || o.id} sudah dibayar — perlu dikirim`,
              created_at: o.updated_at || o.created_at || new Date().toISOString(),
              read: false,
            });
            changed = true;
          }
        }
        if (changed) {
          localStorage.setItem("wastrahub_admin_notifs", JSON.stringify(existing.slice(0, 50)));
          setNotifs(existing.slice(0, 50));
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    pollPaidOrders();
    const interval = setInterval(pollPaidOrders, 15000);
    const onPaid = () => {
      refreshNotifs();
      pollPaidOrders();
    };
    window.addEventListener("wastrahub:order-paid", onPaid);
    window.addEventListener("storage", onPaid);
    return () => {
      clearInterval(interval);
      window.removeEventListener("wastrahub:order-paid", onPaid);
      window.removeEventListener("storage", onPaid);
    };
  }, [pollPaidOrders, refreshNotifs]);

  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    const next = notifs.map((n) => ({ ...n, read: true }));
    localStorage.setItem("wastrahub_admin_notifs", JSON.stringify(next));
    setNotifs(next);
  };

  const NAV = [
    { to: "/admin", end: true, label: t("admin_dashboard"), icon: LayoutDashboard },
    { to: "/admin/products", label: t("admin_products"), icon: Package },
    {
      to: "/admin/orders",
      label: t("admin_orders"),
      icon: ShoppingBag,
      badge: needShipCount,
    },
    { to: "/admin/reviews", label: t("admin_reviews"), icon: MessageSquare },
    { to: "/admin/reports", label: t("admin_reports"), icon: BarChart3 },
  ];

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin/login");
  };

  return (
    <div className="admin-shell">
      <div className={`admin-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="admin-sidebar__brand">
          <a href="/">WastraHub</a>
          <p>Admin</p>
        </div>
        <nav className="admin-sidebar__nav">
          {NAV.map(({ to, end, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? "active" : ""}`
              }
              onClick={() => setOpen(false)}
            >
              <Icon strokeWidth={1.75} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge > 0 && <span className="admin-nav-badge">{badge}</span>}
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
            <h1 className="font-display">
              {NAV.find((n) =>
                n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
              )?.label || "Admin"}
            </h1>
          </div>
          <div className="admin-header__actions">
            {needShipCount > 0 && (
              <Link to="/admin/orders" className="admin-need-ship-chip">
                {t("admin_need_ship") || "Perlu Dikirim"} · {needShipCount}
              </Link>
            )}
            <div className="admin-notif">
              <button
                type="button"
                className="admin-notif__btn"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notifikasi"
              >
                <Bell size={20} />
                {unread > 0 && <span className="admin-notif__dot">{unread > 9 ? "9+" : unread}</span>}
              </button>
              {notifOpen && (
                <div className="admin-notif__panel">
                  <div className="admin-notif__head">
                    <strong>Notifikasi</strong>
                    {unread > 0 && (
                      <button type="button" className="admin-notif__mark" onClick={markAllRead}>
                        Tandai dibaca
                      </button>
                    )}
                  </div>
                  {notifs.length === 0 ? (
                    <p className="admin-notif__empty">Belum ada notifikasi</p>
                  ) : (
                    <ul className="admin-notif__list">
                      {notifs.slice(0, 10).map((n) => (
                        <li key={n.id} className={n.read ? "" : "unread"}>
                          <Link to="/admin/orders" onClick={() => setNotifOpen(false)}>
                            {n.message}
                          </Link>
                          <span className="admin-notif__time">
                            {n.created_at
                              ? new Date(n.created_at).toLocaleString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}