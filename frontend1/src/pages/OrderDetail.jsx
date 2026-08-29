import { useParams, Link, Navigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import Badge from "../components/common/Badge";
import "./orders.css";

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

// Same dummy pool as MyOrders (simplified lookup)
const ALL_ORDERS = [
  {
    id: "WH-20260809-001",
    date: "9 Agustus 2026",
    status: "belum-dibayar",
    total: 750000,
    subtotal: 750000,
    shipping: 0,
    paymentDeadline: "10 Agustus 2026, 23:59",
    payment: "Transfer Bank",
    address: "Jl. Kemang Raya No. 12, Jakarta Selatan",
    items: [
      { name: "Batik Parang Tulis Premium", qty: 1, price: 750000, image: "/images/products/placeholder.jpg", region: "Yogyakarta" },
    ],
  },
  {
    id: "WH-20260808-002",
    date: "8 Agustus 2026",
    status: "belum-dibayar",
    total: 625000,
    subtotal: 625000,
    shipping: 0,
    paymentDeadline: "9 Agustus 2026, 23:59",
    payment: "GoPay",
    address: "Jl. Sudirman No. 45, Jakarta Pusat",
    items: [
      { name: "Batik Kawung Cap Elegan", qty: 1, price: 350000, image: "/images/products/placeholder.jpg", region: "Pekalongan" },
      { name: "Batik Sekar Jagad Printing", qty: 1, price: 275000, image: "/images/products/placeholder.jpg", region: "Cirebon" },
    ],
  },
  {
    id: "WH-20260807-003",
    date: "7 Agustus 2026",
    status: "belum-dikirim",
    total: 550000,
    subtotal: 550000,
    shipping: 0,
    payment: "OVO",
    address: "Jl. Gatot Subroto No. 8, Jakarta Selatan",
    items: [
      { name: "Batik Truntum Kombinasi", qty: 1, price: 550000, image: "/images/products/placeholder.jpg", region: "Solo" },
    ],
  },
  {
    id: "WH-20260805-004",
    date: "5 Agustus 2026",
    status: "belum-dikirim",
    total: 1100000,
    subtotal: 1100000,
    shipping: 0,
    payment: "Transfer Bank",
    address: "Jl. Asia Afrika No. 3, Bandung",
    items: [
      { name: "Batik Parang Tulis Premium", qty: 1, price: 750000, image: "/images/products/placeholder.jpg", region: "Yogyakarta" },
      { name: "Batik Kawung Cap Elegan", qty: 1, price: 350000, image: "/images/products/placeholder.jpg", region: "Pekalongan" },
    ],
  },
  {
    id: "WH-20260803-005",
    date: "3 Agustus 2026",
    status: "belum-diterima",
    total: 720000,
    subtotal: 720000,
    shipping: 0,
    tracking: "JNE - 882910384756",
    payment: "DANA",
    address: "Jl. Kemang Raya No. 12, Jakarta Selatan",
    items: [
      { name: "Batik Mega Mendung Cirebon", qty: 1, price: 720000, image: "/images/products/placeholder.jpg", region: "Cirebon" },
    ],
  },
];

const statusMap = {
  "belum-dibayar": { labelKey: "tab_unpaid", variant: "new" },
  "belum-dikirim": { labelKey: "tab_unshipped", variant: "secondary" },
  "belum-diterima": { labelKey: "tab_undelivered", variant: "primary" },
  selesai: { labelKey: "tab_done", variant: "success" },
  batal: { labelKey: "tab_cancel", variant: "default" },
};

export default function OrderDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const order = ALL_ORDERS.find((o) => o.id === id);

  if (!order) {
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
            <p className="order-detail__id">{order.id}</p>
          </div>
          <Badge variant={st.variant}>{t(st.labelKey)}</Badge>
        </div>

        <div className="order-detail__grid">
          <section className="order-detail__panel">
            <h2>{t("orders_items")}</h2>
            <ul className="order-detail__items">
              {order.items.map((item, i) => (
                <li key={i} className="order-detail__item">
                  <img src={item.image} alt="" onError={(e) => { e.currentTarget.src = "/images/products/placeholder.jpg"; }} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.region}</span>
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
                  <dd>{order.date}</dd>
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
              <p>{order.address || "—"}</p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
