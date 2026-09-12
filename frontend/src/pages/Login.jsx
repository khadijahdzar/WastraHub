import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { loginRequest } from "../services/authService";
import Button from "../components/common/Button";
import "./auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || location.state?.from || "/";
  const infoMessage = location.state?.message || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await loginRequest(email, password);
      login(data.user, data.token);
      localStorage.setItem("wastrahub_user_token", data.token);
      navigate(typeof from === "string" ? from : "/", { replace: true });
    } catch (err) {
      setError(err.message || t("login_fail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <img
            src="/images/logos/wastrahub-logo-full.png"
            alt="WastraHub"
            className="auth-logo-img"
          />
        </Link>
        <h1>{t("login_title")}</h1>
        <p className="auth-subtitle">{t("login_sub")}</p>

        {infoMessage && !error && (
          <div
            className="auth-info"
            style={{
              background: "#fef3c7",
              color: "#92400e",
              padding: "12px 14px",
              borderRadius: 10,
              fontSize: 14,
              marginBottom: 16,
              lineHeight: 1.45,
            }}
          >
            {infoMessage}
          </div>
        )}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t("email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label>{t("password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
            {t("sign_in")}
          </Button>
        </form>

        <p className="auth-switch">
          {t("no_account")} <Link to="/register">{t("sign_up")}</Link>
        </p>
      </div>
    </div>
  );
}