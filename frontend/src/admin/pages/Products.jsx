import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { products as seed } from "../../data/products";
import { useLanguage } from "../../context/LanguageContext";
import "../admin.css";

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const empty = { name: "", price: "", stock: "", category: "Perempuan", status: "active", description: "" };

export default function Products() {
  const { t } = useLanguage();
  const [list, setList] = useState(() => seed.map((p) => ({ ...p, status: (p.stock || 0) > 0 ? "active" : "draft" })));
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const filtered = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const openAdd = () => { setForm(empty); setModal("add"); };
  const openEdit = (p) => {
    setForm({ name: p.name, price: String(p.price), stock: String(p.stock ?? 0), category: p.category || "Perempuan", status: p.status || "active", description: p.description || "" });
    setModal(p);
  };
  const save = (e) => {
    e.preventDefault();
    const payload = { name: form.name.trim(), price: Number(form.price) || 0, stock: Number(form.stock) || 0, category: form.category, status: form.status, description: form.description, images: ["/images/products/placeholder.jpg"] };
    if (modal === "add") setList((prev) => [{ id: Date.now(), ...payload, rating: 5, reviews: 0 }, ...prev]);
    else setList((prev) => prev.map((p) => (p.id === modal.id ? { ...p, ...payload } : p)));
    setModal(null);
  };
  const remove = (id) => { if (confirm(t("admin_delete_product") + "?")) setList((prev) => prev.filter((p) => p.id !== id)); };

  return (
    <>
      <div className="admin-toolbar">
        <input className="admin-search" placeholder={t("search") + "..."} value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" className="admin-btn admin-btn--primary" onClick={openAdd}><Plus size={16} /> {t("admin_add_product")}</button>
      </div>
      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>{t("admin_product_name")}</th><th>{t("admin_price")}</th><th>{t("admin_stock")}</th><th>{t("admin_status")}</th><th>{t("actions")}</th></tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td><td>{formatRupiah(p.price)}</td><td>{p.stock}</td>
                  <td><span className={`admin-badge ${p.status === "active" ? "admin-badge--success" : "admin-badge--muted"}`}>{p.status}</span></td>
                  <td><div className="admin-actions">
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => openEdit(p)}><Pencil size={14} /></button>
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => remove(p.id)}><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header"><h2>{modal === "add" ? t("admin_add_product") : t("admin_edit_product")}</h2>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModal(null)}>{t("close")}</button></div>
            <form onSubmit={save}>
              <div className="admin-modal__body">
                <div className="admin-field"><label>{t("admin_product_name")}</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="admin-field-row">
                  <div className="admin-field"><label>{t("admin_price")}</label><input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                  <div className="admin-field"><label>{t("admin_stock")}</label><input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
                </div>
                <div className="admin-field"><label>{t("admin_status")}</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">active</option><option value="draft">draft</option>
                  </select>
                </div>
                <div className="admin-field"><label>{t("admin_desc")}</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="admin-btn admin-btn--outline" onClick={() => setModal(null)}>{t("cancel")}</button>
                <button type="submit" className="admin-btn admin-btn--primary">{t("save")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
