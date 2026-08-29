import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { registerRequest } from "../services/authService";
import Button from "../components/common/Button";
import "./auth.css";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError(t("password_mismatch"));
      return;
    }
    setLoading(true);
    try {
      const { data } = await registerRequest({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("wastrahub_token", data.token);
      login(data.user);
      navigate("/");
    } catch (err) {
      setError(err.message || t("register_fail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <img src="/images/logos/wastrahub-logo-nav.png" alt="WastraHub" className="auth-logo-img" />
        </Link>
        <h1>{t("register_title")}</h1>
        <p className="auth-subtitle">{t("register_sub")}</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t("full_name")}</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>{t("email")}</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>{t("password")}</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>{t("password_confirm")}</label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
            {loading ? t("processing") : t("sign_up")}
          </Button>
        </form>

        <p className="auth-switch">
          {t("has_account")} <Link to="/login">{t("sign_in")}</Link>
        </p>
      </div>
    </div>
  );
}
