import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ImagePlus } from "lucide-react";
import {
  adminFetchProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import "../admin.css";

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const CATEGORIES = [
  { id: 1, name: "Batik Tulis", type: "Batik Tulis" },
  { id: 2, name: "Batik Cap", type: "Batik Cap" },
  { id: 3, name: "Batik Premium", type: "Batik Premium" },
  { id: 4, name: "Batik Modern", type: "Batik Modern" },
];

const TECHNIQUES = ["Tulis", "Cap", "Modern", "Printing", "Kombinasi"];

const PAGE_SIZE = 12;

const empty = {
  name: "",
  price: "",
  stock: "",
  category_id: 1,
  technique: "Tulis",
  material: "",
  status: "active",
  description: "",
  region_id: "",
  image: "",
  imagePreview: "",
};

export default function Products() {
  const { t } = useLanguage();
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetchProducts();
      setList(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const filtered = list.filter((p) =>
    (p.name || "").toLowerCase().includes(q.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const openAdd = () => {
    setForm(empty);
    setModal("add");
  };

  const openEdit = (p) => {
    setForm({
      name: p.name || "",
      price: String(p.price ?? ""),
      stock: String(p.stock ?? 0),
      category_id: p.category_id || 1,
      technique: p.technique || p.type?.replace("Batik ", "") || "Tulis",
      material: p.material || "",
      status: p.status || "active",
      description: p.description || "",
      region_id: p.region_id || "",
      image: p.image || p.image_url || "",
      imagePreview: p.image || p.image_url || "",
    });
    setModal(p);
  };

  const onImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maks 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setForm((f) => ({ ...f, image: dataUrl, imagePreview: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const cat = CATEGORIES.find((c) => c.id === Number(form.category_id));
    const payload = {
      name: form.name.trim(),
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      category_id: Number(form.category_id) || 1,
      type: cat?.type || `Batik ${form.technique}`,
      technique: form.technique,
      material: form.material || null,
      status: form.status,
      description: form.description || null,
      region_id: form.region_id ? Number(form.region_id) : null,
      image: form.image || "/images/products/placeholder.jpg",
      slug: form.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    };

    try {
      if (modal === "add") {
        const res = await adminCreateProduct(payload);
        if (res.source === "api") await load();
        else setList((prev) => [res.data, ...prev]);
      } else {
        const res = await adminUpdateProduct(modal.id, payload);
        if (res.source === "api") await load();
        else
          setList((prev) =>
            prev.map((p) =>
              p.id === modal.id ? { ...p, ...res.data } : p
            )
          );
      }
      setModal(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm((t("admin_delete_product") || "Hapus produk") + "?")) return;
    try {
      const res = await adminDeleteProduct(id);
      if (res.source === "api") await load();
      else setList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const pageNumbers = (() => {
    const nums = [];
    for (let n = 1; n <= totalPages; n++) {
      if (
        n === 1 ||
        n === totalPages ||
        Math.abs(n - currentPage) <= 1
      ) {
        nums.push(n);
      }
    }
    return nums;
  })();

  return (
    <div className="admin-page-fade">
      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder={(t("search") || "Cari") + "..."}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={openAdd}
        >
          <Plus size={16} /> {t("admin_add_product") || "Tambah Produk"}
        </button>
      </div>

      {!loading && (
        <p className="admin-muted" style={{ marginBottom: 8 }}>
          Menampilkan {pageItems.length} dari {filtered.length} produk
          {list.length !== filtered.length ? ` (filter dari ${list.length})` : ""}
        </p>
      )}

      {error && (
        <p className="admin-login__error" style={{ marginBottom: 12 }}>
          {error}
        </p>
      )}

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Gambar</th>
                <th>{t("admin_product_name") || "Nama"}</th>
                <th>{t("admin_price") || "Harga"}</th>
                <th>{t("admin_stock") || "Stok"}</th>
                <th>Teknik</th>
                <th>{t("admin_status") || "Status"}</th>
                <th>{t("actions") || "Aksi"}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>Memuat...</td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7}>Tidak ada produk</td>
                </tr>
              ) : (
                pageItems.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        className="admin-thumb"
                        src={
                          p.image ||
                          p.image_url ||
                          "/images/products/placeholder.jpg"
                        }
                        alt=""
                        onError={(e) => {
                          e.currentTarget.src =
                            "/images/products/placeholder.jpg";
                        }}
                      />
                    </td>
                    <td>{p.name}</td>
                    <td>{formatRupiah(p.price)}</td>
                    <td>{p.stock}</td>
                    <td>{p.technique || p.type || "—"}</td>
                    <td>
                      <span
                        className={`admin-badge ${
                          p.status === "active"
                            ? "admin-badge--success"
                            : "admin-badge--muted"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--sm"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--sm"
                          onClick={() => remove(p.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div
            className="admin-pagination"
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginTop: 16,
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <span className="admin-muted">
              Halaman {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            {pageNumbers.map((n, idx) => (
              <span key={n} style={{ display: "inline-flex", gap: 4 }}>
                {idx > 0 && pageNumbers[idx - 1] !== n - 1 && (
                  <span className="admin-muted">…</span>
                )}
                <button
                  type="button"
                  className={`admin-btn admin-btn--sm ${
                    n === currentPage
                      ? "admin-btn--primary"
                      : "admin-btn--ghost"
                  }`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              </span>
            ))}
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div
            className="admin-modal admin-modal--lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <h2>
                {modal === "add"
                  ? t("admin_add_product") || "Tambah Produk Baru"
                  : t("admin_edit_product") || "Edit Produk"}
              </h2>
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => setModal(null)}
              >
                {t("close") || "Tutup"}
              </button>
            </div>
            <form onSubmit={save}>
              <div className="admin-modal__body">
                <div className="admin-field">
                  <label>Gambar Produk</label>
                  <div className="admin-image-upload">
                    {form.imagePreview ? (
                      <img
                        src={form.imagePreview}
                        alt="Preview"
                        className="admin-image-preview"
                      />
                    ) : (
                      <div className="admin-image-placeholder">
                        <ImagePlus size={28} />
                        <span>Upload gambar</span>
                      </div>
                    )}
                    <div className="admin-image-actions">
                      <label className="admin-btn admin-btn--outline admin-btn--sm">
                        Pilih File
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={onImageFile}
                        />
                      </label>
                      <input
                        type="text"
                        inputMode="url"
                        placeholder="atau tempel URL gambar"
                        value={
                          form.image?.startsWith("data:") ? "" : form.image
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            image: e.target.value,
                            imagePreview: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-field">
                  <label>{t("admin_product_name") || "Nama Produk"}</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>

                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>{t("admin_price") || "Harga"}</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>{t("admin_stock") || "Stok"}</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Kategori</label>
                    <select
                      value={form.category_id}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category_id: Number(e.target.value),
                        })
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Teknik</label>
                    <select
                      value={form.technique}
                      onChange={(e) =>
                        setForm({ ...form, technique: e.target.value })
                      }
                    >
                      {TECHNIQUES.map((tech) => (
                        <option key={tech} value={tech}>
                          {tech}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Material</label>
                    <input
                      value={form.material}
                      onChange={(e) =>
                        setForm({ ...form, material: e.target.value })
                      }
                      placeholder="Katun Primisima"
                    />
                  </div>
                  <div className="admin-field">
                    <label>{t("admin_status") || "Status"}</label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </div>
                </div>

                <div className="admin-field">
                  <label>{t("admin_desc") || "Deskripsi"}</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="admin-modal__footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--outline"
                  onClick={() => setModal(null)}
                >
                  {t("cancel") || "Batal"}
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : t("save") || "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}