import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Printer, Trash2 } from "lucide-react";
import {
  adminFetchOrders,
  adminUpdateOrderStatus,
  adminDeleteOrder,
} from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import "../admin.css";

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const STATUS_FLOW = [
  { value: "pending", label: "Belum Dibayar" },
  { value: "paid", label: "Sudah Dibayar" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

const STATUS_CLASS = {
  pending: "pending",
  unpaid: "pending",
  paid: "paid",
  processing: "processing",
  shipped: "shipped",
  completed: "completed",
  cancelled: "cancelled",
};

export default function Orders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetchOrders();
      setOrders(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const onPaid = () => load();
    const onUpdated = () => load();
    window.addEventListener("wastrahub:order-paid", onPaid);
    window.addEventListener("wastrahub:order-created", onPaid);
    window.addEventListener("wastrahub:orders-updated", onUpdated);
    window.addEventListener("storage", onPaid);
    const interval = setInterval(load, 20000);
    return () => {
      window.removeEventListener("wastrahub:order-paid", onPaid);
      window.removeEventListener("wastrahub:order-created", onPaid);
      window.removeEventListener("wastrahub:orders-updated", onUpdated);
      window.removeEventListener("storage", onPaid);
      clearInterval(interval);
    };
  }, [load]);

  const onStatus = async (id, status) => {
    setOrders((prev) =>
      prev.map((o) => (String(o.id) === String(id) ? { ...o, status } : o))
    );
    try {
      await adminUpdateOrderStatus(id, status);
      window.dispatchEvent(new CustomEvent("wastrahub:orders-updated"));
    } catch (err) {
      alert(err.message);
      load();
    }
  };

  const removeOrder = async (order) => {
    const status = String(order.status || "").toLowerCase();
    if (!["completed", "cancelled"].includes(status)) return;
    if (
      !window.confirm(
        "Hapus riwayat pesanan ini? Data tidak dapat dipulihkan."
      )
    )
      return;

    try {
      await adminDeleteOrder(order);
      setOrders((previous) =>
        previous.filter((item) => String(item.id) !== String(order.id))
      );
      window.dispatchEvent(new CustomEvent("wastrahub:orders-updated"));
    } catch (err) {
      alert(err.message);
    }
  };

  const itemLabel = (o) => {
    if (o.details?.length) {
      return o.details
        .map((d) => d.product?.name || `Produk #${d.product_id}`)
        .join(", ");
    }
    if (o.items?.length) {
      return o.items
        .map((d) => d.name || d.product?.name || "Item")
        .join(", ");
    }
    return "—";
  };

  const needShip = orders.filter((o) =>
    ["pending", "unpaid", "paid", "processing"].includes(
      String(o.status || "").toLowerCase()
    )
  );

  const filtered =
    filter === "all"
      ? orders
      : filter === "need_ship"
        ? needShip
        : orders.filter((o) => String(o.status).toLowerCase() === filter);

  const handlePrint = (o) => {
    const items = itemLabel(o);
    const w = window.open("", "_blank", "width=420,height=640");
    if (!w) {
      alert("Izinkan pop-up untuk mencetak struk");
      return;
    }
    const total = formatRupiah(o.total_amount ?? o.total ?? 0);
    const code = o.order_number || o.id;
    const buyer = o.customer_name || o.user?.name || "—";
    const phone = o.phone || "—";
    const addr = o.address || "—";
    const status = o.status || "—";
    const date = o.created_at
      ? new Date(o.created_at).toLocaleString("id-ID")
      : "—";
    w.document.write(`<!DOCTYPE html><html><head><title>Struk ${code}</title>
<style>
  @page { size: A4 portrait; margin: 12mm; }
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, serif;
    width: 100%;
    margin: 0;
    padding: 0;
    color: #26170c;
    font-size: 14px;
    line-height: 1.45;
  }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .sub { font-size: 12px; color: #795830; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  td { padding: 6px 0; vertical-align: top; }
  td:first-child { color: #81756e; width: 110px; }
  .line { border-top: 1px dashed #d2c4bc; margin: 12px 0; }
  .total { font-size: 16px; font-weight: 700; }
  @media screen {
    body { max-width: 520px; margin: 0 auto; padding: 24px; }
  }
  @media print {
    body { padding: 0; }
    .no-print { display: none; }
  }
</style></head><body>
  <h1>WastraHub</h1>
  <div class="sub">Struk / Label Pengiriman</div>
  <table>
    <tr><td>No. Pesanan</td><td><strong>${code}</strong></td></tr>
    <tr><td>Tanggal</td><td>${date}</td></tr>
    <tr><td>Status</td><td>${status}</td></tr>
    <tr><td>Pembeli</td><td>${buyer}</td></tr>
    <tr><td>Telepon</td><td>${phone}</td></tr>
    <tr><td>Alamat</td><td>${addr}</td></tr>
    <tr><td>Item</td><td>${items}</td></tr>
  </table>
  <div class="line"></div>
  <div class="total">Total: ${total}</div>
  <p style="margin-top:24px;font-size:11px;color:#81756e">Terima kasih telah berbelanja di WastraHub.</p>
  <script>window.onload=function(){window.print();}</script>
</body></html>`);
    w.document.close();
  };

  return (
    <div className="admin-page-fade">
      <div className="admin-toolbar">
        <div className="admin-toolbar__filters">
          <button
            type="button"
            className={`admin-chip ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Semua ({orders.length})
          </button>
          <button
            type="button"
            className={`admin-chip admin-chip--needs-shipping ${
              filter === "need_ship" ? "active" : ""
            }`}
            onClick={() => setFilter("need_ship")}
          >
            {t("admin_need_ship") || "Perlu Dikirim"} ({needShip.length})
          </button>
          <button
            type="button"
            className={`admin-chip ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Belum Dibayar (
            {
              orders.filter(
                (o) => String(o.status || "").toLowerCase() === "pending"
              ).length
            }
            )
          </button>
          <button
            type="button"
            className={`admin-chip ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Selesai
          </button>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--sm"
          onClick={load}
          disabled={loading}
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {needShip.length > 0 && filter === "all" && (
        <p className="admin-alert admin-alert--warn">
          {t("admin_need_ship") || "Perlu Dikirim"}:{" "}
          <strong>{needShip.length}</strong> pesanan menunggu diproses /
          dikirim.
        </p>
      )}

      {error && <p className="admin-login__error">{error}</p>}

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin_code") || "Kode"}</th>
                <th>{t("admin_buyers") || "Pembeli"}</th>
                <th>{t("admin_item") || "Item"}</th>
                <th>Total</th>
                <th>{t("admin_status") || "Status"}</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>Memuat...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>Belum ada pesanan</td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const st = String(o.status || "pending").toLowerCase();
                  const isNeed = ["paid", "processing"].includes(st);
                  return (
                    <tr
                      key={o.id}
                      className={isNeed ? "row-highlight" : undefined}
                    >
                      <td>
                        <strong>{o.order_number || o.id}</strong>
                      </td>
                      <td>
                        <div className="admin-cell-stack">
                          <span>
                            {o.customer_name || o.user?.name || "—"}
                          </span>
                          {o.phone && (
                            <span className="admin-muted">{o.phone}</span>
                          )}
                        </div>
                      </td>
                      <td className="admin-cell-clamp">{itemLabel(o)}</td>
                      <td>
                        {formatRupiah(o.total_amount ?? o.total ?? 0)}
                      </td>
                      <td>
                        <select
                          className={`admin-select admin-select--status status-${
                            STATUS_CLASS[st] || "pending"
                          }`}
                          value={
                            STATUS_FLOW.some((s) => s.value === st)
                              ? st
                              : st === "unpaid"
                                ? "pending"
                                : st
                          }
                          onChange={(e) => onStatus(o.id, e.target.value)}
                        >
                          {STATUS_FLOW.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--sm"
                          title="Cetak Struk"
                          onClick={() => handlePrint(o)}
                        >
                          <Printer size={14} />
                        </button>
                        {["completed", "cancelled"].includes(st) && (
                          <button
                            type="button"
                            className="admin-btn admin-btn--danger admin-btn--sm"
                            title="Hapus riwayat"
                            onClick={() => removeOrder(o)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}