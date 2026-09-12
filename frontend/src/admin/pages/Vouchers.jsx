import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import "../admin.css";

function readVouchers() {
  try {
    const value = JSON.parse(localStorage.getItem("wastrahub_vouchers") || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

const empty = { code: "", type: "percent", value: "", active: true };

export default function Vouchers() {
  const [vouchers, setVouchers] = useState(readVouchers);
  const [form, setForm] = useState(empty);

  const save = (event) => {
    event.preventDefault();
    const code = form.code.trim().toUpperCase();
    const value = Number(form.value);
    if (!code || !value || value < 0) return;
    const next = [
      ...vouchers.filter((voucher) => voucher.code !== code),
      { code, type: form.type, value, active: true },
    ];
    setVouchers(next);
    localStorage.setItem("wastrahub_vouchers", JSON.stringify(next));
    setForm(empty);
  };

  const remove = (code) => {
    const next = vouchers.filter((voucher) => voucher.code !== code);
    setVouchers(next);
    localStorage.setItem("wastrahub_vouchers", JSON.stringify(next));
  };

  return (
    <div className="admin-page-fade">
      <div className="admin-toolbar">
        <h2 className="font-display">Voucher</h2>
      </div>
      <div className="admin-panel" style={{ padding: "1.25rem" }}>
        <form className="admin-field-row" onSubmit={save}>
          <div className="admin-field">
            <label>Kode voucher</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="BATIK10" required />
          </div>
          <div className="admin-field">
            <label>Jenis potongan</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="percent">Persentase (%)</option>
              <option value="fixed">Nominal (Rp)</option>
            </select>
          </div>
          <div className="admin-field">
            <label>Nilai</label>
            <input type="number" min="1" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
          </div>
          <div className="admin-field" style={{ display: "flex", alignItems: "end" }}>
            <button type="submit" className="admin-btn admin-btn--primary"><Plus size={16} /> Tambah Voucher</button>
          </div>
        </form>
      </div>
      <div className="admin-panel" style={{ marginTop: "1rem" }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Kode</th><th>Potongan</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {vouchers.length === 0 ? <tr><td colSpan={4}>Belum ada voucher</td></tr> : vouchers.map((voucher) => (
                <tr key={voucher.code}>
                  <td><strong>{voucher.code}</strong></td>
                  <td>{voucher.type === "percent" ? `${voucher.value}%` : `Rp ${Number(voucher.value).toLocaleString("id-ID")}`}</td>
                  <td><span className="admin-badge admin-badge--success">AKTIF</span></td>
                  <td><button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => remove(voucher.code)} aria-label={`Hapus ${voucher.code}`}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
