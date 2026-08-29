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
import { formatPrice } from "../data/products";
import { fetchProduct, fetchProducts } from "../services/productService";
import ProductCard from "../components/card/ProductCard";
import ProductReviews from "../components/common/ProductReviews";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import "./product-detail.css";

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
  const { t } = useLanguage();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    setActiveImage(0);
    (async () => {
      try {
        const res = await fetchProduct(id);
        if (cancelled) return;
        setProduct(res.data);
        const all = await fetchProducts({});
        if (cancelled) return;
        const list = (all.data || []).filter(
          (p) =>
            p.id !== res.data.id &&
            (p.region === res.data.region || p.category === res.data.category)
        );
        setRelated(list.slice(0, 4));
      } catch {
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <p style={{ opacity: 0.6 }}>Memuat produk...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <h2>{t("product_not_found")}</h2>
        <Link
          to="/collections"
          style={{ color: "var(--secondary)", marginTop: 16, display: "inline-block" }}
        >
          Kembali ke Koleksi
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
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    triggerFlyToCart();
  };

  const philosophyText =
    product.philosophy ||
    `Motif ${product.name} merepresentasikan nilai-nilai luhur budaya Jawa. Setiap goresan dan cap membawa filosofi kehidupan, keselarasan, serta penghormatan terhadap warisan leluhur yang terus dilestarikan oleh pengrajin lokal.`;

  const careText =
    product.care ||
    `Cuci dengan tangan menggunakan air dingin dan detergen lembut. Jangan diperas atau dijemur langsung di bawah matahari terik. Setrika dengan suhu rendah dari sisi dalam kain. Simpan di tempat kering dan sejuk.`;

  return (
    <div className="product-detail">
      {/* Flying image animation (Shopee-style) */}
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
          {/* Gallery — 1 gambar utama */}
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

          {/* Info */}
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
              <span className="pd-info__reviews">({product.reviews} reviews)</span>
            </div>

            <div className="pd-info__price">{formatPrice(product.price)}</div>
            {product.originalPrice && (
              <div className="pd-info__price-old">{formatPrice(product.originalPrice)}</div>
            )}

            <div className="pd-info__meta-row">
              <div className="pd-meta-item">
                <span className="pd-meta-label">Availability</span>
                <span className={`pd-meta-val ${product.stock > 0 ? "is-instock" : "is-out"}`}>
                  <span className="pd-dot" />
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              <div className="pd-meta-item">
                <span className="pd-meta-label">Stock</span>
                <span className="pd-meta-val">{product.stock} items left</span>
              </div>
            </div>

            <div className="pd-info__material">
              <span className="pd-meta-label">Material</span>
              <span className="pd-meta-val">
                {product.material}
                {product.technique ? ` · ${product.technique}` : ""}
              </span>
            </div>

            <div className="pd-info__qty">
              <span className="pd-meta-label">Quantity</span>
              <div className="pd-qty">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  aria-label="Kurangi"
                  disabled={qty <= 1}
                >
                  <Minus size={16} />
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
                  aria-label="Tambah"
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
                Add to Cart
              </button>
              <button
                type="button"
                className={`pd-btn pd-btn--wish ${wishlisted ? "is-active" : ""}`}
                onClick={() => setWishlisted((v) => !v)}
              >
                <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
                Wishlist
              </button>
            </div>

            <div className="pd-trust">
              {TRUST.map((t) => (
                <div key={t.label} className="pd-trust__item">
                  <t.icon size={16} strokeWidth={1.75} />
                  <span>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
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
                      <strong>Technique:</strong> {product.technique || product.category}
                    </li>
                    <li>
                      <strong>Origin:</strong> {product.region}
                      {product.region === "Solo" || product.region === "Yogyakarta"
                        ? ", Central Java"
                        : ""}
                    </li>
                    <li>
                      <strong>Material:</strong> {product.material}
                    </li>
                    <li>
                      <strong>Stock:</strong> {product.stock} available
                    </li>
                  </ul>
                </>
              )}
              {activeTab === "philosophy" && <p>{philosophyText}</p>}
              {activeTab === "care" && <p>{careText}</p>}
            </div>

            <aside className="pd-artisan-card">
              <h4>Artisan Crafted</h4>
              <p>
                Each piece takes days to complete, ensuring unique character in every stamp
                and stroke by master artisans.
              </p>
            </aside>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="pd-related">
            <h2>More from {product.region} Collection</h2>
            <div className="pd-related__grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="pd-reviews-wrap">
          <ProductReviews productId={product.id} />
        </section>
      </div>
    </div>
  );
}