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
        {unread > 0 && (
          <span className="admin-notif__dot">
            {unread > 9 ? "9+" : unread}
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
            {unread > 0 && (
              <button
                type="button"
                className="admin-notif__mark"
                onClick={onMarkAllRead}
              >
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
                  <Link
                    to="/admin/orders"
                    className="admin-notif__item"
                    onClick={onClose}
                  >
                    <div className="admin-notif__row">
                      <span className="admin-notif__msg">
                        {n.message || "Pesanan perlu dikirim"}
                      </span>
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