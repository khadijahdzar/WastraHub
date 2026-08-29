import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { loginRequest } from "../../services/authService";
import "../admin.css";

const ADMIN_EMAILS = ["admin@wastrahub.com", "admin@batikartisan.com"];

export default function AdminLogin() {
  const { login, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAdmin) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const normalized = email.trim().toLowerCase();

    try {
      const { data, source } = await loginRequest(normalized, password);
      const user = data.user;

      if (user.role !== "admin" && user.role !== "superadmin") {
        if (
          ADMIN_EMAILS.includes(normalized) &&
          password === "admin123" &&
          source === "dummy"
        ) {
          login({
            id: "admin-1",
            name: "Admin WastraHub",
            email: normalized,
            role: "admin",
          });
          localStorage.setItem("wastrahub_token", data.token);
          navigate("/admin", { replace: true });
          return;
        }
        setError("Akun ini bukan admin.");
        return;
      }

      localStorage.setItem("wastrahub_token", data.token);
      login({ ...user, role: user.role || "admin" });
      navigate("/admin", { replace: true });
    } catch (err) {
      if (ADMIN_EMAILS.includes(normalized) && password === "admin123") {
        login({
          id: "admin-1",
          name: "Admin WastraHub",
          email: normalized,
          role: "admin",
        });
        localStorage.setItem("wastrahub_token", "dummy-admin-token");
        navigate("/admin", { replace: true });
        return;
      }
      setError(
        err.message ||
          "Email / password salah. Demo: admin@wastrahub.com / admin123"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <h1 className="font-display">{t("admin_login")}</h1>
        <p className="admin-login__sub">WastraHub Admin</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="admin-login__error">{error}</div>}
          <div className="admin-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@wastrahub.com"
              autoComplete="username"
              required
            />
          </div>
          <div className="admin-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="admin-btn admin-btn--primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "..." : t("nav_login")}
          </button>
        </form>
        <p className="admin-login__hint">
          Demo: <code>admin@wastrahub.com</code> / <code>admin123</code>
          <br />
          <span style={{ opacity: 0.7 }}>(atau admin@batikartisan.com)</span>
        </p>
      </div>
    </div>
  );
}