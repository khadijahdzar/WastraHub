import { useLanguage } from "../../context/LanguageContext";
import "../admin.css";

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const rows = [
  { date: "2026-08-09", orders: 6, revenue: 4200000 },
  { date: "2026-08-08", orders: 4, revenue: 3100000 },
  { date: "2026-08-07", orders: 5, revenue: 2800000 },
  { date: "2026-08-06", orders: 3, revenue: 1500000 },
  { date: "2026-08-05", orders: 7, revenue: 5100000 },
];

export default function Reports() {
  const { t } = useLanguage();
  const total = rows.reduce((s, r) => s + r.revenue, 0);
  return (
    <>
      <div className="admin-stats">
        <div className="admin-stat-card"><p className="admin-stat-card__label">{t("admin_sales_report")}</p><p className="admin-stat-card__value">{formatRupiah(total)}</p></div>
        <div className="admin-stat-card"><p className="admin-stat-card__label">{t("admin_total_orders")}</p><p className="admin-stat-card__value">{rows.reduce((s, r) => s + r.orders, 0)}</p></div>
      </div>
      <div className="admin-panel">
        <h2 className="admin-panel__title">{t("admin_sales_report")}</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>{t("admin_date")}</th><th>Order</th><th>{t("admin_revenue")}</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.date}><td>{r.date}</td><td>{r.orders}</td><td>{formatRupiah(r.revenue)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
