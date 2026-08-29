import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { formatPrice } from "../data/products";
import { markPurchased } from "../utils/reviews";
import { createOrder, buildPaymentMethod } from "../services/orderService";
import Button from "../components/common/Button";
import "./checkout.css";

const EWALLETS = [
  { id: "dana", name: "DANA", color: "#118EE9" },
  { id: "gopay", name: "GoPay", color: "#00AED6" },
  { id: "ovo", name: "OVO", color: "#4C3494" },
  { id: "shopeepay", name: "ShopeePay", color: "#EE4D2D" },
  { id: "brimo", name: "BRImo", color: "#0057A0" },
];

const BANKS = [
  { id: "bca", name: "BCA", color: "#0060AF", account: "1234567890" },
  { id: "bni", name: "BNI", color: "#F15A22", account: "0987654321" },
  { id: "mandiri", name: "Mandiri", color: "#003D79", account: "1122334455" },
  { id: "bri", name: "BRI", color: "#0057A0", account: "5566778899" },
  { id: "cimb", name: "CIMB Niaga", color: "#EE1C25", account: "6677889900" },
];

export default function Checkout() {
  const { t, lang } = useLanguage();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postal: "",
    courier: "jne",
    payment: "transfer",
    ewallet: "",
    bank: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "payment") {
        if (value !== "ewallet") next.ewallet = "";
        if (value !== "transfer") next.bank = "";
      }
      return next;
    });
    if (error) setError("");
  };

  const selectedBank = BANKS.find((b) => b.id === form.bank);
  const selectedEwallet = EWALLETS.find((w) => w.id === form.ewallet);

  const requiredMsg = (fieldKey) =>
    lang === "en"
      ? `${t(fieldKey)} is required.`
      : `${t(fieldKey)} wajib diisi.`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError(requiredMsg("checkout_name"));
      return;
    }
    if (!form.phone.trim()) {
      setError(requiredMsg("checkout_phone"));
      return;
    }
    if (!form.address.trim()) {
      setError(requiredMsg("checkout_address"));
      return;
    }
    if (!form.city.trim()) {
      setError(lang === "en" ? "City is required." : "Kota wajib diisi.");
      return;
    }
    if (!form.postal.trim()) {
      setError(requiredMsg("checkout_postal"));
      return;
    }
    if (form.payment === "ewallet" && !form.ewallet) {
      setError(
        lang === "en"
          ? "Please select an e-wallet."
          : "Pilih e-wallet yang ingin digunakan."
      );
      return;
    }
    if (form.payment === "transfer" && !form.bank) {
      setError(
        lang === "en" ? "Please select a bank." : "Pilih bank untuk transfer."
      );
      return;
    }
    if (!items.length) {
      setError(lang === "en" ? "Cart is empty." : "Keranjang kosong.");
      return;
    }

    setSubmitting(true);

    (async () => {
      try {
        if (user?.id) {
          markPurchased(
            user.id,
            items.map((i) => i.id)
          );
        }

        const fullAddress = [form.address, form.city, form.postal]
          .filter(Boolean)
          .join(", ");

        const payload = {
          customer_name: form.name.trim(),
          phone: form.phone.trim(),
          address: fullAddress,
          courier: form.courier,
          payment_method: buildPaymentMethod(form),
          total_amount: subtotal,
          items: items.map((i) => ({
            product_id: i.id,
            quantity: i.quantity,
            price: i.price,
            subtotal: i.price * i.quantity,
          })),
        };

        const { data: order, source } = await createOrder(payload);
        console.info("[checkout] order created via", source, order);

        clearCart();
        // arahkan ke detail jika ada id, else list
        if (order?.id) {
          navigate(`/orders/${order.id}`);
        } else {
          navigate("/orders");
        }
      } catch (err) {
        console.error(err);
        setError(
          err.message ||
            (lang === "en"
              ? "Failed to process order. Please try again."
              : "Gagal memproses pesanan. Coba lagi.")
        );
        setSubmitting(false);
      }
    })();
  };

  if (items.length === 0) {
    return (
      <div
        className="container"
        style={{ padding: "80px 24px", textAlign: "center" }}
      >
        <h2>
          {lang === "en"
            ? "No items to checkout"
            : "Tidak ada item untuk checkout"}
        </h2>
        <Button
          variant="primary"
          onClick={() => navigate("/collections")}
          style={{ marginTop: 16 }}
        >
          {t("hero_shop")}
        </Button>
      </div>
    );
  }

  const paymentOptions = [
    { v: "transfer", l: t("checkout_bank") },
    { v: "ewallet", l: t("checkout_ewallet") },
    { v: "cod", l: t("checkout_cod") },
  ];

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>{t("checkout_title")}</h1>
        <form onSubmit={handleSubmit} className="checkout__grid" noValidate>
          <div className="checkout__form">
            <section>
              <h3>{t("checkout_shipping")}</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>{t("checkout_name")}</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={lang === "en" ? "Full name" : "Nama lengkap"}
                  />
                </div>
                <div className="form-group">
                  <label>{t("checkout_phone")}</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>{t("checkout_address")}</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder={
                    lang === "en"
                      ? "Street, number, RT/RW, village"
                      : "Jalan, nomor, RT/RW, kelurahan"
                  }
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t("checkout_city")}</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder={lang === "en" ? "e.g. Jakarta" : "Contoh: Jakarta"}
                  />
                </div>
                <div className="form-group">
                  <label>{t("checkout_postal")}</label>
                  <input
                    name="postal"
                    value={form.postal}
                    onChange={handleChange}
                    placeholder="12345"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3>{lang === "en" ? "Courier" : "Kurir"}</h3>
              <div className="radio-group">
                {["jne", "jnt", "sicepat"].map((c) => (
                  <label key={c} className="radio-card">
                    <input
                      type="radio"
                      name="courier"
                      value={c}
                      checked={form.courier === c}
                      onChange={handleChange}
                    />
                    <span>{c.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h3>{t("checkout_payment")}</h3>
              <div className="radio-group">
                {paymentOptions.map((p) => (
                  <label key={p.v} className="radio-card">
                    <input
                      type="radio"
                      name="payment"
                      value={p.v}
                      checked={form.payment === p.v}
                      onChange={handleChange}
                    />
                    <span>{p.l}</span>
                  </label>
                ))}
              </div>

              {form.payment === "transfer" && (
                <div className="ewallet-options">
                  <p className="ewallet-options__label">
                    {lang === "en" ? "Select Bank" : "Pilih Bank"}
                  </p>
                  <div className="ewallet-options__grid">
                    {BANKS.map((b) => (
                      <label
                        key={b.id}
                        className={`ewallet-card ${
                          form.bank === b.id ? "ewallet-card--active" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="bank"
                          value={b.id}
                          checked={form.bank === b.id}
                          onChange={handleChange}
                        />
                        <span
                          className="ewallet-card__badge"
                          style={{ background: b.color }}
                        >
                          {b.name.charAt(0)}
                        </span>
                        <span className="ewallet-card__name">{b.name}</span>
                      </label>
                    ))}
                  </div>

                  {selectedBank && (
                    <div className="bank-account-info">
                      <p className="bank-account-info__title">
                        {lang === "en"
                          ? "Transfer to the following account:"
                          : "Transfer ke rekening berikut:"}
                      </p>
                      <div className="bank-account-info__box">
                        <span className="bank-account-info__bank">
                          Bank {selectedBank.name}
                        </span>
                        <span className="bank-account-info__number">
                          {selectedBank.account}
                        </span>
                        <span className="bank-account-info__name">
                          a.n. PT WastraHub Indonesia
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {form.payment === "ewallet" && (
                <div className="ewallet-options">
                  <p className="ewallet-options__label">
                    {lang === "en" ? "Select" : "Pilih"} {t("checkout_ewallet")}
                  </p>
                  <div className="ewallet-options__grid">
                    {EWALLETS.map((w) => (
                      <label
                        key={w.id}
                        className={`ewallet-card ${
                          form.ewallet === w.id ? "ewallet-card--active" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="ewallet"
                          value={w.id}
                          checked={form.ewallet === w.id}
                          onChange={handleChange}
                        />
                        <span
                          className="ewallet-card__badge"
                          style={{ background: w.color }}
                        >
                          {w.name.charAt(0)}
                        </span>
                        <span className="ewallet-card__name">{w.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="checkout__summary">
            <h3>{t("checkout_order")}</h3>
            {items.map((item) => (
              <div key={item.id} className="checkout__item">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="checkout__total">
              <span>{t("cart_total")}</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            {form.payment === "transfer" && form.bank && (
              <p className="checkout__pay-note">
                {lang === "en" ? "Transfer via" : "Transfer via"}{" "}
                <strong>Bank {selectedBank?.name}</strong>
              </p>
            )}

            {form.payment === "ewallet" && form.ewallet && (
              <p className="checkout__pay-note">
                {lang === "en" ? "Pay with" : "Bayar dengan"}{" "}
                <strong>{selectedEwallet?.name}</strong>
              </p>
            )}

            {form.payment === "cod" && (
              <p className="checkout__pay-note">
                {lang === "en"
                  ? "Pay on delivery when the package arrives (COD)"
                  : "Bayar di tempat saat barang diterima (COD)"}
              </p>
            )}

            {error && <p className="checkout__error">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={submitting}
            >
              {submitting ? t("processing") : t("orders_pay_now")}
            </Button>
          </aside>
        </form>
      </div>
    </div>
  );
}
