import { Link } from "react-router-dom";
import { Bell } from "lucide-react";

export default function NotificationDropdown({
  open,
  onToggle,
  notifs = [],
  unread = 0,
  onMarkAllRead,
  onClose,
}) {
  // Fallback pengaman: Jika props notifs kosong, coba tarik data pesanan lokal/terakhir
  let displayNotifs = notifs;
  if (!displayNotifs || displayNotifs.length === 0) {
    try {
      const localOrders = JSON.parse(localStorage.getItem("wastrahub_user_orders") || "[]");
      displayNotifs = localOrders.slice(0, 5).map((ord) => ({
        id: ord.id,
        message: `Pesanan baru #${ord.id} - ${ord.paymentMethod || 'COD/Transfer'}`,
        created_at: ord.date || new Date().toISOString(),
        read: false,
      }));
    } catch {
      displayNotifs = [];
    }
  }

  const displayUnread = unread > 0 ? unread : displayNotifs.filter(n => !n.read).length;

  return (
    <div className="admin-notif">
      <button
        type="button"
        className="admin-notif__btn"
        onClick={onToggle}
        aria-label="Notifikasi"
        aria-expanded={open}
      >
        <Bell size={20} />
        {displayUnread > 0 && (
          <span className="admin-notif__dot">
            {displayUnread > 9 ? "9+" : displayUnread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="admin-notif__panel"
          role="dialog"
          aria-label="Daftar notifikasi"
        >
          <div className="admin-notif__head">
            <strong>Notifikasi</strong>
            {displayUnread > 0 && (
              <button
                type="button"
                className="admin-notif__mark"
                onClick={onMarkAllRead}
              >
                Tandai dibaca
              </button>
            )}
          </div>

          {displayNotifs.length === 0 ? (
            <p className="admin-notif__empty">Belum ada notifikasi</p>
          ) : (
            <ul className="admin-notif__list">
              {displayNotifs.slice(0, 10).map((n) => (
                <li key={n.id || Math.random()} className={n.read ? "" : "unread"}>
                  <Link
                    to="/admin/orders"
                    className="admin-notif__item"
                    onClick={onClose}
                  >
                    <div className="admin-notif__row">
                      <span className="admin-notif__msg">
                        {n.message || n.title || "Pesanan baru masuk"}
                      </span>
                      <span className="admin-notif__time">
                        {n.created_at || n.date
                          ? new Date(n.created_at || n.date).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}