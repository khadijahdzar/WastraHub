import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Star,
  ShieldCheck,
  Gem,
  Lock,
  Truck,
  ChevronRight,
} from "lucide-react";
import { formatPrice, getProductById, products as localProducts } from "../data/products";
import { fetchProduct, fetchProducts } from "../services/productService";
import ProductCard from "../components/card/ProductCard";
import ProductReviews from "../components/common/ProductReviews";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import "./product-detail.css";

// Ganti dengan nomor WA WastraHub (format internasional tanpa +)
const WA_NUMBER = "6282134008512";

const TRUST = [
  { icon: ShieldCheck, labelKey: "product_authentic" },
  { icon: Gem, labelKey: "product_artisan" },
  { icon: Lock, labelKey: "product_secure" },
  { icon: Truck, labelKey: "product_fast" },
];

const TABS = [
  { id: "description", labelKey: "product_description" },
  { id: "philosophy", labelKey: "product_philosophy" },
  { id: "care", labelKey: "product_care" },
];

export default function ProductDetail() {
  const { t, lang } = useLanguage();
  const { id } = useParams();
  const localProduct = getProductById(id);
  const [product, setProduct] = useState(localProduct || null);
  const [related, setRelated] = useState(() =>
    localProduct
      ? localProducts
          .filter(
            (item) =>
              item.id !== localProduct.id &&
              (item.region === localProduct.region || item.category === localProduct.category)
          )
          .slice(0, 4)
      : []
  );
  const [loading, setLoading] = useState(!localProduct);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [wishlisted, setWishlisted] = useState(false);
  const [flyImg, setFlyImg] = useState(null);
  const mainImgRef = useRef(null);
  const cartBtnRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const immediateProduct = getProductById(id);
    if (immediateProduct) {
      setProduct(immediateProduct);
      setRelated(
        localProducts
          .filter(
            (item) =>
              item.id !== immediateProduct.id &&
              (item.region === immediateProduct.region || item.category === immediateProduct.category)
          )
          .slice(0, 4)
      );
      setLoading(false);
    } else {
      setLoading(true);
    }
    setActiveImage(0);
    (async () => {
      try {
        const [res, all] = await Promise.all([
          fetchProduct(id),
          fetchProducts({}),
        ]);
        if (cancelled) return;
        setProduct(res.data);
        const list = (all.data || []).filter(
          (p) =>
            p.id !== res.data.id &&
            (p.region === res.data.region || p.category === res.data.category)
        );
        setRelated(list.slice(0, 4));
      } catch {
        if (!cancelled && !immediateProduct) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return null;
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <h2>{t("product_not_found")}</h2>
        <Link
          to="/collections"
          style={{ color: "var(--secondary)", marginTop: 16, display: "inline-block" }}
        >
          {t("product_back")}
        </Link>
      </div>
    );
  }

  const images =
    product.images?.length > 0
      ? product.images
      : ["/images/products/placeholder.jpg"];

  const triggerFlyToCart = () => {
    const imgEl = mainImgRef.current;
    if (!imgEl) {
      addToCart(product, qty);
      return;
    }

    const rect = imgEl.getBoundingClientRect();

    const cartIcon =
      document.querySelector("[data-cart-icon]") ||
      document.querySelector('a[href="/cart"]') ||
      document.querySelector(".navbar__cart") ||
      cartBtnRef.current;

    let endX = window.innerWidth - 80;
    let endY = 40;
    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect();
      endX = cartRect.left + cartRect.width / 2;
      endY = cartRect.top + cartRect.height / 2;
    }

    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    setFlyImg({
      src: images[activeImage],
      startX,
      startY,
      endX,
      endY,
      size: Math.min(rect.width, rect.height, 120),
    });

    addToCart(product, qty);
    setTimeout(() => setFlyImg(null), 900);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/product/${id}`,
              message: t("product_login_required"),
        },
      });
      return;
    }
    triggerFlyToCart();
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/checkout",
              message: t("product_login_required"),
        },
      });
      return;
    }
    addToCart(product, qty);
    navigate("/checkout");
  };

  const philosophyText =
    product.philosophy ||
    t("product_philosophy_default").replace("{name}", product.name);

  const careText =
    product.care ||
    t("product_care_default");

  const waMessage =
    lang === "en"
      ? `Hi WastraHub, I am interested in ${product.name}`
      : `Halo WastraHub, saya tertarik dengan produk ${product.name}`;

  return (
    <div className="product-detail">
      {flyImg && (
        <div
          className="pd-fly-img"
          style={{
            "--start-x": `${flyImg.startX}px`,
            "--start-y": `${flyImg.startY}px`,
            "--end-x": `${flyImg.endX}px`,
            "--end-y": `${flyImg.endY}px`,
            "--fly-size": `${flyImg.size}px`,
          }}
        >
          <img src={flyImg.src} alt="" />
        </div>
      )}

      <div className="container">
        <nav className="pd-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to="/collections">Collections</Link>
          <ChevronRight size={14} />
          <Link to={`/collections?category=${encodeURIComponent(product.category)}`}>
            {product.category}
          </Link>
          <ChevronRight size={14} />
          <span>{product.name}</span>
        </nav>

        <div className="pd-top">
          <div className="pd-gallery">
            <div className="pd-gallery__main" ref={mainImgRef}>
              <img src={images[activeImage]} alt={product.name} />
            </div>

            {images.length > 1 && (
              <div className="pd-gallery__thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`pd-gallery__thumb ${i === activeImage ? "is-active" : ""}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pd-info">
            <div className="pd-info__badges">
              <span className="pd-badge pd-badge--region">{product.region}</span>
              <span className="pd-badge pd-badge--cat">{product.category}</span>
            </div>

            <h1 className="pd-info__title">{product.name}</h1>

            <div className="pd-info__rating">
              <div className="pd-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={15}
                    fill={s <= Math.round(product.rating) ? "#BB9457" : "none"}
                    color="#BB9457"
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <span className="pd-info__rating-val">{product.rating}</span>
              <span className="pd-info__reviews">({product.reviews} {t("product_reviews_count")})</span>
            </div>

            <div className="pd-info__price">{formatPrice(product.price)}</div>
            {product.originalPrice && (
              <div className="pd-info__price-old">{formatPrice(product.originalPrice)}</div>
            )}

            <div className="pd-info__meta-row">
              <div className="pd-meta-item">
                <span className="pd-meta-label">{t("product_availability")}</span>
                <span className={`pd-meta-val ${product.stock > 0 ? "is-instock" : "is-out"}`}>
                  <span className="pd-dot" />
                  {product.stock > 0 ? t("product_in_stock") : t("product_out_of_stock")}
                </span>
              </div>
              <div className="pd-meta-item">
                <span className="pd-meta-label">{t("product_stock")}</span>
                <span className="pd-meta-val">{product.stock} {t("product_items_left")}</span>
              </div>
            </div>

            <div className="pd-info__material">
              <span className="pd-meta-label">{t("product_material")}</span>
              <span className="pd-meta-val">
                {product.material}
                {product.technique ? ` · ${product.technique}` : ""}
              </span>
            </div>

            <div className="pd-info__qty">
              <span className="pd-meta-label">{t("product_qty")}</span>
              <div className="pd-qty">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  aria-label={t("product_decrease")}
                  disabled={qty <= 1}
                >
                  <Minus size={16} />
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
                  aria-label={t("product_increase")}
                  disabled={qty >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="pd-info__actions">
              <button
                ref={cartBtnRef}
                type="button"
                className="pd-btn pd-btn--cart"
                onClick={handleAddToCart}
                disabled={product.stock < 1}
              >
                <ShoppingCart size={18} />
                {t("product_add_cart") || "Tambah Keranjang"}
              </button>
              <button
                type="button"
                className="pd-btn pd-btn--buy"
                onClick={handleBuyNow}
                disabled={product.stock < 1}
              >
                {t("product_buy_now") || "Beli Sekarang"}
              </button>
              <button
                type="button"
                className={`pd-btn pd-btn--wish ${wishlisted ? "is-active" : ""}`}
                onClick={() => setWishlisted((v) => !v)}
              >
                <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            <a
              className="wa-btn"
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t("product_chat_wa") || "Chat via WhatsApp"}
            </a>

            <div className="pd-trust">
              {TRUST.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.labelKey} className="pd-trust__item">
                    <Icon size={16} strokeWidth={1.75} />
                    <span>{t(item.labelKey)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pd-tabs-section">
          <div className="pd-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`pd-tab ${activeTab === tab.id ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.labelKey ? t(tab.labelKey) : tab.label}
              </button>
            ))}
          </div>

          <div className="pd-tabs-body">
            <div className="pd-tabs-content">
              {activeTab === "description" && (
                <>
                  <p>{product.description}</p>
                  <ul>
                    <li>
                      <strong>{t("product_technique_label")}:</strong> {product.technique || product.category}
                    </li>
                    <li>
                      <strong>{t("product_origin")}:</strong> {product.region}
                      {product.region === "Solo" || product.region === "Yogyakarta"
                        ? ", Central Java"
                        : ""}
                    </li>
                    <li>
                      <strong>{t("product_material")}:</strong> {product.material}
                    </li>
                    <li>
                      <strong>{t("product_stock")}:</strong> {product.stock} {t("product_available")}
                    </li>
                  </ul>
                </>
              )}
              {activeTab === "philosophy" && <p>{philosophyText}</p>}
              {activeTab === "care" && <p>{careText}</p>}
            </div>

            <aside className="pd-artisan-card">
              <h4>{t("product_artisan_title")}</h4>
              <p>{t("product_artisan_desc")}</p>
            </aside>
          </div>
        </div>

        {related.length > 0 && (
          <section className="pd-related">
            <h2>{t("product_more_from")} {product.region} {t("product_collection")}</h2>
            <div className="pd-related__grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        <section className="pd-reviews-wrap">
          <ProductReviews productId={product.id} />
        </section>
      </div>
    </div>
  );
}