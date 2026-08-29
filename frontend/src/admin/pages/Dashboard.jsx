import { useMemo } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { products } from "../../data/products";
import "../admin.css";

const recentOrders = [
  { code: "WH-20260809-001", name: "Anindya Devi", total: 750000 },
  { code: "WH-20260808-002", name: "Raka Wijaya", total: 625000 },
  { code: "WH-20260807-003", name: "Maya Kusuma", total: 550000 },
  { code: "WH-20260803-005", name: "Isabella V.", total: 720000 },
];
const chart = [8.5, 7.5, 12.5, 9.8, 11.2, 15.4, 8.9];
const labels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const { t } = useLanguage();
  const stats = useMemo(() => ({
    revenue: 12850000,
    orders: 48,
    products: products.filter((p) => (p.stock ?? 0) > 0).length,
    rating: "4.8",
  }), []);
  const max = Math.max(...chart);
  return (
    <>
      <div className="admin-stats">
        <div className="admin-stat-card"><p className="admin-stat-card__label">{t("admin_revenue")}</p><p className="admin-stat-card__value">{formatRupiah(stats.revenue)}</p></div>
        <div className="admin-stat-card"><p className="admin-stat-card__label">{t("admin_total_orders")}</p><p className="admin-stat-card__value">{stats.orders}</p></div>
        <div className="admin-stat-card"><p className="admin-stat-card__label">{t("admin_active_products")}</p><p className="admin-stat-card__value">{stats.products}</p></div>
        <div className="admin-stat-card"><p className="admin-stat-card__label">{t("admin_avg_rating")}</p><p className="admin-stat-card__value accent">{stats.rating}</p></div>
      </div>
      <div className="admin-grid-2">
        <div className="admin-panel">
          <h2 className="admin-panel__title">{t("admin_sales_report")} (7 hari)</h2>
          <div className="admin-chart">
            {chart.map((v, i) => (
              <div key={i} className="admin-chart__bar-wrap">
                <span className="admin-chart__value">{v}</span>
                <div className="admin-chart__bar" style={{ height: `${(v / max) * 100}%` }} />
                <span className="admin-chart__label">{labels[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-panel">
          <h2 className="admin-panel__title">{t("admin_recent_orders")}</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>{t("admin_code")}</th><th>{t("admin_buyers")}</th><th>Total</th></tr></thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.code}><td>{o.code}</td><td>{o.name}</td><td>{formatRupiah(o.total)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
