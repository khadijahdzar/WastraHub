import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import Badge from "../components/common/Badge";
import Toast from "../components/common/Toast";
import PaymentInstructionModal from "../components/common/PaymentInstructionModal";
import { fetchOrder, payOrder } from "../services/orderService";
import "./orders.css";

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
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
};

const statusMap = {
  "belum-dibayar": { labelKey: "tab_unpaid", variant: "new" },
  "belum-dikirim": { labelKey: "tab_unshipped", variant: "secondary" },
  "belum-diterima": { labelKey: "tab_undelivered", variant: "primary" },
  selesai: { labelKey: "tab_done", variant: "success" },
  batal: { labelKey: "status_cancelled", variant: "default" },
};

export default function OrderDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [paying, setPaying] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [payModalOpen, setPayModalOpen] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ open: true, message, type });
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    (async () => {
      try {
        const res = await fetchOrder(id);
        if (!cancelled) setOrder(res.data);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const openPayModal = () => {
    if (!order || paying) return;
    setPayModalOpen(true);
  };

  const confirmPay = async () => {
    if (!order || paying) return;
    setPaying(true);
    try {
      const res = await payOrder(order.id);
      setOrder({ ...order, ...res.data, status: "belum-dikirim", statusRaw: "paid" });
      setPayModalOpen(false);
      showToast(
        t("orders_pay_success") ||
          "Pembayaran berhasil! Pesanan Anda sedang diproses untuk dikirim."
      );
    } catch (err) {
      showToast(err.message || "Gagal memproses pembayaran", "error");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return null;
  }

  if (notFound || !order) {
    return <Navigate to="/orders" replace />;
  }

  const st = statusMap[order.status] || statusMap["belum-dibayar"];

  return (
    <div className="orders-page order-detail-page">
      <div className="container">
        <Link to="/orders" className="order-detail__back">
          ← {t("orders_back")}
        </Link>
        <div className="order-detail__header">
          <div>
            <h1>{t("orders_detail")}</h1>
            <p className="order-detail__id">{order.code}</p>
          </div>
          <Badge variant={st.variant}>{t(st.labelKey)}</Badge>
        </div>

        <div className="order-detail__grid">
          <section className="order-detail__panel">
            <h2>{t("orders_items")}</h2>
            <ul className="order-detail__items">
              {(order.items || []).map((item, i) => (
                <li key={i} className="order-detail__item">
                  <img
                    src={item.image}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = "/images/products/placeholder.jpg";
                    }}
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.region || "—"}</span>
                    <span>
                      {item.qty} × {formatRupiah(item.price)}
                    </span>
                  </div>
                  <div className="order-detail__item-total">
                    {formatRupiah(item.qty * item.price)}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside className="order-detail__side">
            <section className="order-detail__panel">
              <h2>{t("orders_summary")}</h2>
              <dl className="order-detail__dl">
                <div>
                  <dt>{t("orders_date")}</dt>
                  <dd>{formatDate(order.date)}</dd>
                </div>
                <div>
                  <dt>{t("orders_status")}</dt>
                  <dd>{t(st.labelKey)}</dd>
                </div>
                <div>
                  <dt>{t("orders_payment")}</dt>
                  <dd>{order.payment || "—"}</dd>
                </div>
                {order.tracking && (
                  <div>
                    <dt>{t("orders_tracking")}</dt>
                    <dd>{order.tracking}</dd>
                  </div>
                )}
                <div>
                  <dt>{t("orders_subtotal")}</dt>
                  <dd>{formatRupiah(order.subtotal ?? order.total)}</dd>
                </div>
                <div>
                  <dt>{t("orders_shipping")}</dt>
                  <dd>{formatRupiah(order.shipping ?? 0)}</dd>
                </div>
                <div className="order-detail__total-row">
                  <dt>{t("orders_total")}</dt>
                  <dd>{formatRupiah(order.total)}</dd>
                </div>
              </dl>
            </section>
            <section className="order-detail__panel">
              <h2>{t("orders_address")}</h2>
              {order.customer_name && (
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{order.customer_name}</p>
              )}
              {order.phone && (
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: 4 }}>
                  {order.phone}
                </p>
              )}
              <p>{order.address || "—"}</p>
            </section>

            <div className="order-detail__actions">
              {order.status === "belum-dibayar" && (
                <button
                  type="button"
                  className="order-btn order-btn--primary order-btn--block"
                  onClick={openPayModal}
                  disabled={paying}
                  aria-busy={paying}
                >
                  {t("orders_pay_now")}
                </button>
              )}
              {order.status === "belum-diterima" && (
                <button type="button" className="order-btn order-btn--primary order-btn--block">
                  {t("orders_received")}
                </button>
              )}
              <Link to="/orders" className="order-btn order-btn--ghost order-btn--block">
                {t("orders_back")}
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <PaymentInstructionModal
        open={payModalOpen}
        order={order}
        onClose={() => !paying && setPayModalOpen(false)}
        onConfirm={confirmPay}
        loading={paying}
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