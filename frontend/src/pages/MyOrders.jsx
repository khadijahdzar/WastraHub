import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import Badge from "../components/common/Badge";
import Toast from "../components/common/Toast";
import PaymentInstructionModal from "../components/common/PaymentInstructionModal";
import { useLanguage } from "../context/LanguageContext";
import { fetchOrders, payOrder } from "../services/orderService";
import "./orders.css";

const TABS = [
  { id: "belum-dibayar", labelKey: "tab_unpaid", icon: Clock },
  { id: "belum-dikirim", labelKey: "tab_unshipped", icon: Package },
  { id: "belum-diterima", labelKey: "tab_undelivered", icon: Truck },
  { id: "selesai", labelKey: "tab_done", icon: CheckCircle2 },
  { id: "batal", labelKey: "tab_cancel", icon: XCircle },
];

const statusMap = {
  "belum-dibayar": { labelKey: "tab_unpaid", variant: "new" },
  "belum-dikirim": { labelKey: "tab_unshipped", variant: "secondary" },
  "belum-diterima": { labelKey: "tab_undelivered", variant: "primary" },
  selesai: { labelKey: "tab_done", variant: "success" },
  batal: { labelKey: "status_cancelled", variant: "default" },
};

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(n) || 0);

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

export default function MyOrders() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("belum-dibayar");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [payModalOrder, setPayModalOrder] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ open: true, message, type });
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openPayModal = (order) => {
    if (payingId) return;
    setPayModalOrder(order);
  };

  const confirmPay = async () => {
    const order = payModalOrder;
    if (!order || payingId) return;
    setPayingId(order.id);
    try {
      const res = await payOrder(order.id);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, ...res.data, status: "belum-dikirim", statusRaw: "paid" }
            : o
        )
      );
      setPayModalOrder(null);
      showToast(
        t("orders_pay_success") ||
          "Pembayaran berhasil! Pesanan Anda sedang diproses untuk dikirim."
      );
      setActiveTab("belum-dikirim");
    } catch (err) {
      showToast(err.message || "Gagal memproses pembayaran", "error");
    } finally {
      setPayingId(null);
    }
  };

  const filtered = orders.filter((o) => o.status === activeTab);
  const currentTab = TABS.find((tab) => tab.id === activeTab);
  const getCount = (id) => orders.filter((o) => o.status === id).length;

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <div>
            <h1>{t("orders_title")}</h1>
            <p className="orders-header__sub">
              Lacak dan kelola seluruh pesanan batik Anda di WastraHub.
            </p>
          </div>
          <button
            type="button"
            className="order-btn order-btn--ghost orders-refresh"
            onClick={load}
            disabled={loading}
            aria-label={t("admin_refresh") || "Refresh"}
          >
            <RefreshCw size={16} />
          </button>
        </div>


        <div className="orders-tabs" role="tablist">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = getCount(tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`orders-tab ${activeTab === tab.id ? "orders-tab--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} strokeWidth={1.75} />
                <span className="orders-tab__label">{t(tab.labelKey)}</span>
                {count > 0 && <span className="orders-tab__count">{count}</span>}
              </button>
            );
          })}
        </div>

        {!loading && filtered.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty__icon">
              {currentTab && <currentTab.icon size={40} strokeWidth={1.5} />}
            </div>
            <h3>{t("orders_empty")}</h3>
            <p>
              Tidak ada pesanan pada kategori “{t(currentTab?.labelKey)}”.
            </p>
            <Link to="/collections" className="orders-empty__cta">
              Belanja Sekarang
            </Link>
          </div>
        ) : !loading ? (
          <div className="orders-list">
            {filtered.map((order) => {
              const st = statusMap[order.status] || statusMap["belum-dibayar"];
              const isPaying = payingId === order.id;
              return (
                <article key={order.id} className="order-card">
                  <div className="order-card__header">
                    <div className="order-card__meta">
                      <span className="order-card__id">{order.code}</span>
                      <span className="order-card__date">{formatDate(order.date)}</span>
                    </div>
                    <Badge variant={st.variant}>{t(st.labelKey)}</Badge>
                  </div>

                  <div className="order-card__items">
                    {(order.items || []).map((item, i) => (
                      <div key={i} className="order-item">
                        <div className="order-item__img">
                          <img
                            src={item.image}
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.src = "/images/products/placeholder.jpg";
                            }}
                          />
                        </div>
                        <div className="order-item__info">
                          <h4>{item.name}</h4>
                          <p>
                            {item.region ? `${item.region} · ` : ""}Qty {item.qty}
                          </p>
                          <span className="order-item__price">
                            {formatRupiah(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.status === "belum-diterima" && order.tracking && (
                    <div className="order-card__alert order-card__alert--info">
                      No. Resi: <strong>{order.tracking}</strong>
                    </div>
                  )}

                  <div className="order-card__footer">
                    <div className="order-card__total">
                      <span>{t("orders_total_label")}</span>
                      <strong>{formatRupiah(order.total)}</strong>
                    </div>
                    <div className="order-card__actions">
                      <Link
                        to={`/orders/${order.id}`}
                        className="order-btn order-btn--ghost"
                      >
                        {t("orders_detail")}
                      </Link>
                      {order.status === "belum-dibayar" && (
                        <button
                          type="button"
                          className="order-btn order-btn--primary"
                          onClick={() => openPayModal(order)}
                          disabled={isPaying || !!payingId}
                          aria-busy={isPaying}
                        >
                          {t("orders_pay_now")}
                        </button>
                      )}
                      {order.status === "belum-diterima" && (
                        <button type="button" className="order-btn order-btn--primary">
                          {t("orders_received")}
                        </button>
                      )}
                      {order.status === "selesai" && (
                        <Link to="/collections" className="order-btn order-btn--primary">
                          {t("orders_buy_again")}
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>

      <PaymentInstructionModal
        open={!!payModalOrder}
        order={payModalOrder}
        onClose={() => !payingId && setPayModalOrder(null)}
        onConfirm={confirmPay}
        loading={!!payingId}
      />
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}