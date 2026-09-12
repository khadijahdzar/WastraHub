import { useLocation } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const STEPS = [
  { id: "cart", pathMatch: (p) => p === "/cart", labelId: "Keranjang", labelEn: "Cart" },
  {
    id: "checkout",
    pathMatch: (p) => p === "/checkout",
    labelId: "Checkout",
    labelEn: "Checkout",
  },
  {
    id: "orders",
    pathMatch: (p) => p.startsWith("/orders"),
    labelId: "Pesanan Saya",
    labelEn: "My Orders",
  },
];

export default function CheckoutProgress() {
  const { pathname } = useLocation();
  const { lang } = useLanguage();

  let activeIndex = STEPS.findIndex((s) => s.pathMatch(pathname));
  if (activeIndex < 0) activeIndex = 0;

  return (
    <div
      className="checkout-progress"
      style={{
        maxWidth: 560,
        margin: "0 auto 32px",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {/* Line background */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "12%",
            right: "12%",
            height: 3,
            background: "#E8DFD4",
            zIndex: 0,
            borderRadius: 2,
          }}
        />
        {/* Line active */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "12%",
            width: `${(activeIndex / (STEPS.length - 1)) * 76}%`,
            height: 3,
            background: "#BB9457",
            zIndex: 1,
            borderRadius: 2,
            transition: "width 0.35s ease",
          }}
        />

        {STEPS.map((step, i) => {
          const done = i <= activeIndex;
          const current = i === activeIndex;
          return (
            <div
              key={step.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 2,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: done ? "#BB9457" : "#fff",
                  border: `2px solid ${done ? "#BB9457" : "#E8DFD4"}`,
                  color: done ? "#fff" : "#6B5E54",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  transition: "all 0.25s ease",
                  boxShadow: current
                    ? "0 0 0 4px rgba(187, 148, 87, 0.25)"
                    : "none",
                }}
              >
                {i + 1}
              </div>
              <span
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  fontWeight: current ? 600 : 500,
                  color: done ? "#432818" : "#6B5E54",
                  textAlign: "center",
                }}
              >
                {lang === "en" ? step.labelEn : step.labelId}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}