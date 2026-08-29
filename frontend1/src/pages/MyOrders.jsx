import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Badge from "../components/common/Badge";
import { useLanguage } from "../context/LanguageContext";
import "./orders.css";

const TABS = [
  {
    id: "belum-dibayar",
    labelKey: "tab_unpaid",
    icon: Clock,
    description: "Pesanan yang baru dibuat tetapi belum diselesaikan pembayarannya.",
  },
  {
    id: "belum-dikirim",
    labelKey: "tab_unshipped",
    icon: Package,
    description: "Pembayaran sudah dikonfirmasi dan menunggu penjual memproses barang.",
  },
  {
    id: "belum-diterima",
    labelKey: "tab_undelivered",
    icon: Truck,
    description: "Paket sedang dalam perjalanan dikirim oleh kurir ke alamat Anda.",
  },
  {
    id: "selesai",
    labelKey: "tab_done",
    icon: CheckCircle2,
    description: "Pesanan telah tiba dan transaksi ditutup.",
  },
  {
    id: "batal",
    labelKey: "tab_cancel",
    icon: XCircle,
    description: "Daftar pesanan yang dibatalkan atau dalam proses klaim dana.",
  },
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
  }).format(n);

const dummyOrders = [
  {
    id: "WH-20260809-001",
    date: "9 Agustus 2026",
    status: "belum-dibayar",
    total: 750000,
    paymentDeadline: "10 Agustus 2026, 23:59",
    items: [
      {
        name: "Batik Parang Tulis Premium",
        qty: 1,
        price: 750000,
        image: "/images/products/placeholder.jpg",
        region: "Yogyakarta",
      },
    ],
  },
  {
    id: "WH-20260808-002",
    date: "8 Agustus 2026",
    status: "belum-dibayar",
    total: 625000,
    paymentDeadline: "9 Agustus 2026, 23:59",
    items: [
      {
        name: "Batik Kawung Cap Elegan",
        qty: 1,
        price: 350000,
        image: "/images/products/placeholder.jpg",
        region: "Pekalongan",
      },
      {
        name: "Batik Sekar Jagad Printing",
        qty: 1,
        price: 275000,
        image: "/images/products/placeholder.jpg",
        region: "Cirebon",
      },
    ],
  },
  {
    id: "WH-20260807-003",
    date: "7 Agustus 2026",
    status: "belum-dikirim",
    total: 550000,
    items: [
      {
        name: "Batik Truntum Kombinasi",
        qty: 1,
        price: 550000,
        image: "/images/products/placeholder.jpg",
        region: "Solo",
      },
    ],
  },
  {
    id: "WH-20260805-004",
    date: "5 Agustus 2026",
    status: "belum-dikirim",
    total: 1100000,
    items: [
      {
        name: "Batik Parang Tulis Premium",
        qty: 1,
        price: 750000,
        image: "/images/products/placeholder.jpg",
        region: "Yogyakarta",
      },
      {
        name: "Batik Kawung Cap Elegan",
        qty: 1,
        price: 350000,
        image: "/images/products/placeholder.jpg",
        region: "Pekalongan",
      },
    ],
  },
  {
    id: "WH-20260803-005",
    date: "3 Agustus 2026",
    status: "belum-diterima",
    total: 720000,
    tracking: "JNE - 882910384756",
    items: [
      {
        name: "Batik Mega Mendung Cirebon",
        qty: 1,
        price: 720000,
        image: "/images/products/placeholder.jpg",
        region: "Cirebon",
      },
    ],
  },
  {
    id: "WH-20260801-006",
    date: "1 Agustus 2026",
    status: "belum-diterima",
    total: 350000,
    tracking: "SiCepat - SCP99821763",
    items: [
      {
        name: "Batik Kawung Cap Elegan",
        qty: 1,
        price: 350000,
        image: "/images/products/placeholder.jpg",
        region: "Pekalongan",
      },
    ],
  },
  {
    id: "WH-20260720-007",
    date: "20 Juli 2026",
    status: "selesai",
    total: 550000,
    items: [
      {
        name: "Batik Truntum Kombinasi",
        qty: 1,
        price: 550000,
        image: "/images/products/placeholder.jpg",
        region: "Solo",
      },
    ],
  },
  {
    id: "WH-20260710-008",
    date: "10 Juli 2026",
    status: "selesai",
    total: 1025000,
    items: [
      {
        name: "Batik Parang Tulis Premium",
        qty: 1,
        price: 750000,
        image: "/images/products/placeholder.jpg",
        region: "Yogyakarta",
      },
      {
        name: "Batik Sekar Jagad Printing",
        qty: 1,
        price: 275000,
        image: "/images/products/placeholder.jpg",
        region: "Cirebon",
      },
    ],
  },
  {
    id: "WH-20260705-009",
    date: "5 Juli 2026",
    status: "batal",
    total: 350000,
    cancelReason: "Dibatalkan pembeli",
    items: [
      {
        name: "Batik Kawung Cap Elegan",
        qty: 1,
        price: 350000,
        image: "/images/products/placeholder.jpg",
        region: "Pekalongan",
      },
    ],
  },
  {
    id: "WH-20260628-010",
    date: "28 Juni 2026",
    status: "batal",
    total: 720000,
    cancelReason: "Pengembalian dana diproses",
    items: [
      {
        name: "Batik Mega Mendung Cirebon",
        qty: 1,
        price: 720000,
        image: "/images/products/placeholder.jpg",
        region: "Cirebon",
      },
    ],
  },
];

export default function MyOrders() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("belum-dibayar");

  const filtered = dummyOrders.filter((o) => o.status === activeTab);
  const currentTab = TABS.find((t) => t.id === activeTab);

  const getCount = (id) => dummyOrders.filter((o) => o.status === id).length;

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>{t("orders_title")}</h1>
          <p className="orders-header__sub">
            Lacak dan kelola seluruh pesanan batik Anda di WastraHub.
          </p>
        </div>

        <div className="orders-tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = getCount(tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                className={`orders-tab ${activeTab === tab.id ? "orders-tab--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} strokeWidth={1.75} />
                <span className="orders-tab__label">{t(tab.labelKey || tab.label)}</span>
                {count > 0 && <span className="orders-tab__count">{count}</span>}
              </button>
            );
          })}
        </div>

        {currentTab && (
          <div className="orders-section-info">
            <p>{currentTab.description}</p>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty__icon">
              {currentTab && <currentTab.icon size={40} strokeWidth={1.5} />}
            </div>
            <h3>{t("orders_empty")}</h3>
            <p>Tidak ada pesanan pada kategori “{currentTab?.label}”.</p>
            <Link to="/collections" className="orders-empty__cta">
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {filtered.map((order) => {
              const st = statusMap[order.status];
              return (
                <article key={order.id} className="order-card">
                  <div className="order-card__header">
                    <div className="order-card__meta">
                      <span className="order-card__id">{order.id}</span>
                      <span className="order-card__date">{order.date}</span>
                    </div>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </div>

                  <div className="order-card__items">
                    {order.items.map((item, i) => (
                      <div key={i} className="order-item">
                        <div className="order-item__img">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="order-item__info">
                          <h4>{item.name}</h4>
                          <p>
                            {item.region} · Qty {item.qty}
                          </p>
                          <span className="order-item__price">{formatRupiah(item.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.status === "belum-dibayar" && order.paymentDeadline && (
                    <div className="order-card__alert order-card__alert--warning">
                      Bayar sebelum <strong>{order.paymentDeadline}</strong>
                    </div>
                  )}
                  {order.status === "belum-diterima" && order.tracking && (
                    <div className="order-card__alert order-card__alert--info">
                      No. Resi: <strong>{order.tracking}</strong>
                    </div>
                  )}
                  {order.status === "batal" && order.cancelReason && (
                    <div className="order-card__alert order-card__alert--muted">
                      {order.cancelReason}
                    </div>
                  )}

                  <div className="order-card__footer">
                    <div className="order-card__total">
                      <span>{t("orders_total_label")}</span>
                      <strong>{formatRupiah(order.total)}</strong>
                    </div>
                    <div className="order-card__actions">
                      {order.status === "belum-dibayar" && (
                        <>
                          <Link to={`/orders/${order.id}`} className="order-btn order-btn--ghost">
                            Detail
                          </Link>
                          <button type="button" className="order-btn order-btn--primary">
                            {t("orders_pay_now")}
                          </button>
                        </>
                      )}
                      {order.status === "belum-dikirim" && (
                        <Link to={`/orders/${order.id}`} className="order-btn">
                          {t("orders_detail")}
                        </Link>
                      )}
                      {order.status === "belum-diterima" && (
                        <>
                          <button type="button" className="order-btn">
                            {t("orders_track")}
                          </button>
                          <button type="button" className="order-btn order-btn--primary">
                            {t("orders_received")}
                          </button>
                        </>
                      )}
                      {order.status === "selesai" && (
                        <>
                          <Link to={`/orders/${order.id}`} className="order-btn">
                            Detail
                          </Link>
                          <Link to="/collections" className="order-btn order-btn--primary">
                            {t("orders_buy_again")}
                          </Link>
                        </>
                      )}
                      {order.status === "batal" && (
                        <Link to={`/orders/${order.id}`} className="order-btn">
                          Detail
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}