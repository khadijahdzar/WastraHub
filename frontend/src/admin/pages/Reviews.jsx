import { useState, useEffect, useCallback, useRef } from "react";
import {
  adminFetchReviews,
  adminApproveReview,
  adminDeleteReview,
} from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import "../admin.css";

export default function Reviews() {
  const { t } = useLanguage();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading((wasEmpty) => wasEmpty && list.length === 0);
    try {
      const res = await adminFetchReviews();
      const data = (res.data || []).map((r) => ({
        ...r,
        approved: r.approved !== undefined ? r.approved : true,
        product: r.product?.name || r.product_name || r.product || "—",
        name: r.user?.name || r.name || r.user_name || "—",
        comment: r.review || r.comment || "",
        rating: r.rating || 5,
      }));
      if (currentRequest === requestId.current) {
        setList(data);
        setSource(res.source);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [list.length]);

  useEffect(() => {
    load();
    const refreshOnFocus = () => load();
    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);
    window.addEventListener("wastrahub:review-created", refreshOnFocus);
    const interval = setInterval(load, 15000);
    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
      window.removeEventListener("wastrahub:review-created", refreshOnFocus);
      clearInterval(interval);
    };
  }, [load]);

  const approve = async (id) => {
    try {
      await adminApproveReview(id);
      setList((p) => p.map((x) => (x.id === id ? { ...x, approved: true } : x)));
    } catch (err) {
      alert(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm("Hapus ulasan?")) return;
    try {
      await adminDeleteReview(id);
      setList((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="admin-stats" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="admin-stat-card">
          <p className="admin-stat-card__label">{t("admin_reviewers")}</p>
          <p className="admin-stat-card__value">{list.length}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-card__label">{t("admin_pending_reviews")}</p>
          <p className="admin-stat-card__value accent">
            {list.filter((r) => !r.approved).length}
          </p>
        </div>
      </div>
      {!loading && (
        <div className="admin-review-grid">
          {list.length === 0 && <p>Belum ada ulasan</p>}
          {list.map((r) => (
            <div key={r.id} className="admin-review-card">
              <div className="admin-stars">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </div>
              <p style={{ fontSize: 14, margin: "8px 0", color: "#4f453f" }}>
                "{r.comment}"
              </p>
              <p style={{ fontSize: 12, fontWeight: 700 }}>{r.name}</p>
              <p style={{ fontSize: 12, color: "#81756e" }}>{r.product}</p>
              <div className="admin-actions" style={{ marginTop: 12 }}>
                {!r.approved ? (
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary admin-btn--sm"
                    onClick={() => approve(r.id)}
                  >
                    Approve
                  </button>
                ) : (
                  <span className="admin-badge admin-badge--success">Approved</span>
                )}
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  onClick={() => remove(r.id)}
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}