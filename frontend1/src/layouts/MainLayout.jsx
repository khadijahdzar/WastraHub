import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useCart } from "../context/CartContext";
import "./main-layout.css";

export default function MainLayout({ children }) {
  const { totalItems } = useCart();

  return (
    <div className="main-layout">
      <Navbar cartCount={totalItems} />
      <main className="main-layout__content">{children}</main>
      <Footer />
    </div>
  );
}