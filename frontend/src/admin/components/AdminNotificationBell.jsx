import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { adminFetchOrders, adminFetchReviews } from "../../services/adminService";

const POLL_MS = 20000;
const READ_KEY = "wastrahub_admin_notif_read";

function loadReadIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveReadIds(set) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...set]));
  } catch {}
}

/**
 * Notification bell — polling order & review baru.
 * Tidak butuh WebSocket; aman untuk demo + offline fallback.
 */
export default function AdminNotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [readIds, setReadIds] = useState(() => loadReadIds());
  const prevCount = useRef(0);
  const boxRef = useRef(null);

  const fetchNotifs = useCallback(async () => {
    try {
      const [ordRes, revRes] = await Promise.all([
        adminFetchOrders().catch(() => ({ data: [] })),
        adminFetchReviews().catch(() => ({ data: [] })),
      ]);

      const orders = (ordRes.data || []).slice(0, 8).map((o) => ({
        id: `order-${o.id || o.code || o.order_number}`,
        type: "order",
        title: `Order baru ${o.id || o.code || o.order_number || ""}`,
        sub: o.customer_name || o.name || o.customer || "Pelanggan",
        href: "/admin/orders",
        at: o.created_at || o.date || Date.now(),
      }));

      const reviews = (revRes.data || []).slice(0, 5).map((r) => ({
        id: `review-${r.id}`,
        type: "review",
        title: "Review produk baru",
        sub: r.comment?.slice(0, 60) || r.product || "Ulasan",
        href: "/admin/reviews",
        at: r.created_at || Date.now(),
      }));

      // Demo seed jika API kosong
      let list = [...orders, ...reviews];
      if (list.length === 0) {
        list = [
          {
            id: "order-demo-1",
            type: "order",
            title: "Order baru WH-DEMO-001",
            sub: "Anindya Devi · Rp 750.000",
            href: "/admin/orders",
            at: Date.now(),
          },
          {
            id: "review-demo-1",
            type: "review",
            title: "Review produk baru",
            sub: "Batik Parang — sangat bagus!",
            href: "/admin/reviews",
            at: Date.now() - 60000,
          },
        ];
      }

      list.sort((a, b) => new Date(b.at) - new Date(a.at));
      setItems(list);

      const unread = list.filter((n) => !readIds.has(n.id)).length;
      if (unread > prevCount.current && prevCount.current > 0) {
        // soft beep optional
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = 880;
          g.gain.value = 0.03;
          o.start();
          o.stop(ctx.currentTime + 0.12);
        } catch {}
      }
      prevCount.current = unread;
    } catch (e) {
      console.warn("[notif]", e);
    }
  }, [readIds]);

  useEffect(() => {
    fetchNotifs();
    const t = setInterval(fetchNotifs, POLL_MS);
    return () => clearInterval(t);
  }, [fetchNotifs]);

  useEffect(() => {
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const unreadCount = items.filter((n) => !readIds.has(n.id)).length;

  const markAllRead = () => {
    const next = new Set(readIds);
    items.forEach((n) => next.add(n.id));
    setReadIds(next);
    saveReadIds(next);
  };

  const openItem = (n) => {
    const next = new Set(readIds);
    next.add(n.id);
    setReadIds(next);
    saveReadIds(next);
    setOpen(false);
    navigate(n.href);
  };

  return (
    <div className="admin-notif" ref={boxRef}>
      <button
        type="button"
        className="admin-notif__btn"
        aria-label="Notifikasi"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={20} strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="admin-notif__badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="admin-notif__dropdown">
          <div className="admin-notif__head">
            <strong>Notifikasi</strong>
            {unreadCount > 0 && (
              <button type="button" className="admin-notif__readall" onClick={markAllRead}>
                Tandai dibaca
              </button>
            )}
          </div>
          <ul className="admin-notif__list">
            {items.length === 0 && (
              <li className="admin-notif__empty">Tidak ada notifikasi</li>
            )}
            {items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  className={`admin-notif__item ${readIds.has(n.id) ? "is-read" : ""}`}
                  onClick={() => openItem(n)}
                >
                  <span className={`admin-notif__dot admin-notif__dot--${n.type}`} />
                  <span className="admin-notif__text">
                    <strong>{n.title}</strong>
                    <small>{n.sub}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
