import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Collections from "./pages/Collections";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import Regions from "./pages/Regions";
import RegionDetail from "./pages/RegionDetail";
import SearchResult from "./pages/SearchResult";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import About from "./pages/About";
import OrderDetail from "./pages/OrderDetail";
import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/Dashboard";
import AdminProducts from "./admin/pages/Products";
import AdminOrders from "./admin/pages/Orders";
import AdminReviews from "./admin/pages/Reviews";
import AdminReports from "./admin/pages/Reports";
import AdminVouchers from "./admin/pages/Vouchers";

/** Cek session admin dari localStorage (tanpa import tambahan) */
function readAdminSession() {
  try {
    const raw = localStorage.getItem("wastrahub_admin_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function AdminRoute({ children }) {
  const location = useLocation();
  const admin = readAdminSession();
  const ok = admin && (admin.role === "admin" || admin.role === "superadmin");
  if (!ok) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/collections"
        element={
          <MainLayout>
            <Collections />
          </MainLayout>
        }
      />
      <Route
        path="/product/:id"
        element={
          <MainLayout>
            <ProductDetail />
          </MainLayout>
        }
      />
      <Route
        path="/categories"
        element={
          <MainLayout>
            <Categories />
          </MainLayout>
        }
      />
      <Route
        path="/regions"
        element={
          <MainLayout>
            <Regions />
          </MainLayout>
        }
      />
      <Route
        path="/regions/:slug"
        element={
          <MainLayout>
            <RegionDetail />
          </MainLayout>
        }
      />
      <Route
        path="/search"
        element={
          <MainLayout>
            <SearchResult />
          </MainLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <MainLayout>
            <Cart />
          </MainLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Checkout />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MyOrders />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <MainLayout>
            <About />
          </MainLayout>
        }
      />
      
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <OrderDetail />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="vouchers" element={<AdminVouchers />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
