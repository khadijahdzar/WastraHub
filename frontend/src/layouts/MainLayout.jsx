import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import DemoModeBanner from "../components/common/DemoModeBanner";
import PageTransition from "../components/common/PageTransition";
import { useCart } from "../context/CartContext";
import "./main-layout.css";

export default function MainLayout({ children }) {
  const { totalItems } = useCart();

  return (
    <div className="main-layout">
      <DemoModeBanner />
      <Navbar cartCount={totalItems} />
      <main className="main-layout__content">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}