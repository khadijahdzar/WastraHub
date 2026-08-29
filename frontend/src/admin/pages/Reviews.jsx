import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import "../admin.css";

const initial = [
  { id: 1, product: "Batik Parang Tulis Premium", name: "Isabella V.", rating: 5, comment: "Quality is outstanding.", approved: true },
  { id: 2, product: "Batik Kawung Cap Elegan", name: "Raka Wijaya", rating: 4, comment: "Bagus, pengiriman agak lama.", approved: true },
  { id: 3, product: "Batik Sidomukti", name: "David L.", rating: 5, comment: "Masterpiece for formal events.", approved: false },
  { id: 4, product: "Batik Parang Tulis Premium", name: "Siti N.", rating: 3, comment: "Motif bagus, packing kurang rapi.", approved: false },
];

export default function Reviews() {
  const { t } = useLanguage();
  const [list, setList] = useState(initial);
  return (
    <>
      <div className="admin-stats" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="admin-stat-card"><p className="admin-stat-card__label">{t("admin_reviewers")}</p><p className="admin-stat-card__value">{list.length}</p></div>
        <div className="admin-stat-card"><p className="admin-stat-card__label">{t("admin_pending_reviews")}</p><p className="admin-stat-card__value accent">{list.filter((r) => !r.approved).length}</p></div>
      </div>
      <div className="admin-review-grid">
        {list.map((r) => (
          <div key={r.id} className="admin-review-card">
            <div className="admin-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            <p style={{ fontSize: 14, margin: "8px 0", color: "#4f453f" }}>"{r.comment}"</p>
            <p style={{ fontSize: 12, fontWeight: 700 }}>{r.name}</p>
            <p style={{ fontSize: 12, color: "#81756e" }}>{r.product}</p>
            <div className="admin-actions" style={{ marginTop: 12 }}>
              {!r.approved ? (
                <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => setList((p) => p.map((x) => (x.id === r.id ? { ...x, approved: true } : x)))}>Approve</button>
              ) : (
                <span className="admin-badge admin-badge--success">Approved</span>
              )}
              <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setList((p) => p.filter((x) => x.id !== r.id))}>{t("delete")}</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
