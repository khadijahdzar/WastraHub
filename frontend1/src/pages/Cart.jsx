import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { formatPrice } from "../data/products";
import Button from "../components/common/Button";
import "./cart.css";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <ShoppingBag size={48} strokeWidth={1.5} />
        <h2>{t("cart_empty_title")}</h2>
        <p>{t("cart_empty_desc")}</p>
        <Link to="/collections">
          <Button variant="primary">{t("cart_continue")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>
          {t("cart_title")}{" "}
          <span>
            ({totalItems} {t("cart_items")})
          </span>
        </h1>
        <div className="cart__grid">
          <div className="cart__items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item__image">
                  <img src={item.images?.[0] || "/images/products/placeholder.jpg"} alt={item.name} />
                </div>
                <div className="cart-item__info">
                  <Link to={`/product/${item.id}`} className="cart-item__name">
                    {item.name}
                  </Link>
                  <span className="cart-item__meta">
                    {item.region} · {item.category}
                  </span>
                  <span className="cart-item__price">{formatPrice(item.price)}</span>
                </div>
                <div className="cart-item__qty">
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
                <div className="cart-item__total">{formatPrice(item.price * item.quantity)}</div>
                <button
                  type="button"
                  className="cart-item__remove"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={t("cart_remove")}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <aside className="cart__summary">
            <h3>{t("cart_summary")}</h3>
            <div className="cart__row">
              <span>{t("cart_subtotal")}</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className="cart__row cart__row--muted">
              <span>{t("cart_shipping")}</span>
              <span>{t("cart_shipping_calc")}</span>
            </div>
            <div className="cart__voucher">
              <input type="text" placeholder={t("cart_voucher")} />
              <button type="button">{t("cart_apply")}</button>
            </div>
            <div className="cart__row cart__row--total">
              <span>{t("cart_total")}</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <Button variant="primary" size="lg" fullWidth onClick={handleCheckout}>
              {t("cart_checkout")}
            </Button>
            <Link to="/collections" className="cart__continue">
              {t("cart_continue")}
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
