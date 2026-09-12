import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { adminFetchReports } from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import "../admin.css";

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function Reports() {
  const { t } = useLanguage();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasReport = useRef(false);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(!hasReport.current);
    setError("");
    try {
      const response = await adminFetchReports();
      if (currentRequest !== requestId.current) return;
      setReport(response.data || {});
      hasReport.current = true;
    } catch (err) {
      if (currentRequest === requestId.current) setError(err.message);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener("wastrahub:order-paid", load);
    window.addEventListener("storage", load);
    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", load);
    const interval = setInterval(load, 20000);
    return () => {
      window.removeEventListener("wastrahub:order-paid", load);
      window.removeEventListener("storage", load);
      window.removeEventListener("focus", load);
      document.removeEventListener("visibilitychange", load);
      clearInterval(interval);
    };
  }, [load]);

  const rows = report?.daily_sales || report?.dailySales || [];
  const total = Number(report?.total_revenue ?? report?.revenue ?? 0);
  const totalOrders = Number(report?.total_orders ?? report?.orders ?? 0);
  return (
    <>
      <div className="admin-stats">
        <div className="admin-stat-card"><p className="admin-stat-card__label">{t("admin_sales_report")}</p><p className="admin-stat-card__value">{formatRupiah(total)}</p></div>
        <div className="admin-stat-card"><p className="admin-stat-card__label">{t("admin_total_orders")}</p><p className="admin-stat-card__value">{totalOrders}</p></div>
      </div>
      <div className="admin-panel">
        <div className="admin-panel__head">
          <h2 className="admin-panel__title">{t("admin_sales_report")}</h2>
          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={load} disabled={loading} title="Refresh laporan">
            <RefreshCw size={16} />
          </button>
        </div>
        {error && <p className="admin-login__error">{error}</p>}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>{t("admin_date")}</th><th>Order</th><th>{t("admin_revenue")}</th></tr></thead>
            <tbody>
              {!loading && rows.length === 0 && <tr><td colSpan="3">Belum ada data penjualan.</td></tr>}
              {!loading && rows.map((r) => (
                <tr key={r.date}><td>{r.date}</td><td>{r.orders}</td><td>{formatRupiah(r.revenue)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
