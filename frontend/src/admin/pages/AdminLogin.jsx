import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { setAdminSession, isAdminLoggedIn } from "../../context/AuthContext";
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
      if (normalized !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        throw new Error("Email atau password admin salah.");
      }
      setAdminSession(
        {
          id: "admin-1",
          name: "Admin WastraHub",
          email: ADMIN_EMAIL,
          role: "admin",
        },
        "dummy-admin-token"
      );
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
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