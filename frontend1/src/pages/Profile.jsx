import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import Button from "../components/common/Button";
import "./profile.css";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t("lang") === "en" ? "File must be an image." : "File harus berupa gambar.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t("profile_upload_hint"));
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setAvatar(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({ ...form, avatar: avatar || null });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initial = (form.name || "U").charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      <div className="container">
        <h1>{t("profile_title")}</h1>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-avatar">
            {avatar ? (
              <img src={avatar} alt="" className="profile-avatar__img" />
            ) : (
              <div className="profile-avatar__circle">{initial}</div>
            )}
            <div className="profile-avatar__actions">
              <button
                type="button"
                className="profile-avatar__btn"
                onClick={() => fileRef.current?.click()}
              >
                {t("profile_change_photo")}
              </button>
              {avatar && (
                <button type="button" className="profile-avatar__btn profile-avatar__btn--danger" onClick={removePhoto}>
                  {t("profile_remove_photo")}
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handlePhoto}
            />
            <p className="profile-avatar__hint">{t("profile_upload_hint")}</p>
          </div>

          {error && <div className="profile-error">{error}</div>}

          <div className="form-group">
            <label>{t("profile_name")}</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>{t("profile_email")}</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>{t("profile_phone")}</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>
          {saved && <div className="profile-saved">{t("profile_saved")}</div>}
          <Button type="submit" variant="primary">
            {t("profile_save")}
          </Button>
        </form>
      </div>
    </div>
  );
}
