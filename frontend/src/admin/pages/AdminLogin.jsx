import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { setAdminSession, isAdminLoggedIn } from "../../context/AuthContext";
import api from "../../api/axios";
import "../admin.css";

const ADMIN_EMAIL = "admin@wastrahub.com";
const ADMIN_PASSWORD = "admin123";

export default function AdminLogin() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAdminLoggedIn()) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const normalized = email.trim().toLowerCase();

    try {
      // 1. Coba login ke API backend untuk mendapatkan token Sanctum riil
      let token = null;
      let adminUser = null;
      try {
        const res = await api.post("/login", {
          email: normalized,
          password: password,
        });
        const body = res?.data ?? res;
        const data = body?.data ?? body;
        token = data?.token ?? data?.access_token ?? body?.token ?? null;
        adminUser = data?.user ?? body?.user ?? null;
        if (adminUser && !["admin", "superadmin"].includes(adminUser.role)) {
          throw new Error("Akun ini bukan akun administrator.");
        }
      } catch (apiErr) {
        if (apiErr?.response?.status === 401 || apiErr?.response?.status === 422) {
          throw new Error("Email atau password admin salah.");
        }
        // Jika server offline / network error / belum seeded di cloud, sediakan demo fallback
        if (normalized !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
          throw new Error(apiErr?.response?.data?.message || "Email atau password admin salah.");
        }
        token = "dummy-admin-token";
        adminUser = {
          id: "admin-1",
          name: "Admin WastraHub",
          email: ADMIN_EMAIL,
          role: "admin",
        };
      }

      if (!token || !adminUser) {
        throw new Error("Gagal memperoleh sesi admin.");
      }

      setAdminSession(adminUser, token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Gagal masuk sebagai admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <img
          src="/images/logos/wastrahub-logo-full.png"
          alt="WastraHub"
          className="admin-login__logo"
        />
        <h1 className="font-display">{t("admin_login")}</h1>
        <p className="admin-login__sub">WastraHub Admin</p>
        {error && <p className="admin-login__error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="admin-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="admin-btn admin-btn--primary"
            style={{ width: "100%", marginTop: 12 }}
            disabled={loading}
          >
            {t("admin_login") || "Login Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}