import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import Button from "./Button";
import { useAuth } from "../../context/AuthContext";
import {
  getReviews,
  addReview,
  hasUserReviewed,
} from "../../utils/reviews";
import "./product-reviews.css";

function Stars({ value, size = 16, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="pr-stars" role={interactive ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = interactive ? n <= (hover || value) : n <= value;
        return (
          <button
            key={n}
            type="button"
            className={`pr-star ${filled ? "pr-star--filled" : ""}`}
            disabled={!interactive}
            aria-label={`${n} bintang`}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange?.(n)}
          >
            <Star
              size={size}
              fill={filled ? "#BB9457" : "none"}
              color={filled ? "#BB9457" : "#C4B5A8"}
            />
          </button>
        );
      })}
    </div>
  );
}

function formatDate(iso, lang = "id") {
  try {
    return new Date(iso).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ProductReviews({ productId }) {
  const { t, lang } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const userId = user?.id ?? user?.email ?? null;
  const alreadyReviewed =
    isAuthenticated && userId && hasUserReviewed(productId, userId);

  useEffect(() => {
    setReviews(getReviews(productId));
    setSuccess(false);
    setError("");
    setComment("");
    setRating(5);
  }, [productId]);

  const avg =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((a, r) => a + Number(r.rating || 0), 0) /
            reviews.length) *
            10
        ) / 10
      : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!isAuthenticated || !userId) {
      setError(
        lang === "en" ? "Please sign in to write a review." : "Silakan login untuk menulis ulasan."
      );
      return;
    }
    if (alreadyReviewed) {
      setError(
        lang === "en" ? "You already reviewed this product." : "Kamu sudah mereview produk ini."
      );
      return;
    }
    if (!comment.trim()) {
      setError(
        lang === "en" ? "Please write a comment." : "Isi komentar ulasan dulu."
      );
      return;
    }
    if (rating < 1 || rating > 5) {
      setError(
        lang === "en" ? "Please choose a rating." : "Pilih rating bintang."
      );
      return;
    }

    addReview(productId, {
      userId,
      userName: user?.name || user?.email || "Pengguna",
      rating,
      comment: comment.trim(),
    });

    setReviews(getReviews(productId));
    setComment("");
    setRating(5);
    setSuccess(true);
  };

  return (
    <section className="product-reviews">
      <div className="product-reviews__header">
        <h2>{t("product_reviews") || "Ulasan Produk"}</h2>
        {avg !== null && (
          <div className="product-reviews__summary">
            <Stars value={Math.round(avg)} size={18} />
            <strong>{avg}</strong>
            <span>
              ({reviews.length} {lang === "en" ? "reviews" : "ulasan"})
            </span>
          </div>
        )}
      </div>

      <div className="product-reviews__form-wrap">
        {/* Belum login */}
        {!isAuthenticated && (
          <p className="product-reviews__hint">
            <Link to="/login">{lang === "en" ? "Sign in" : "Masuk"}</Link>{" "}
            {lang === "en"
              ? "to write a review."
              : "untuk menulis ulasan."}
          </p>
        )}

        {/* Sudah login + sudah pernah review */}
        {isAuthenticated && alreadyReviewed && (
          <p className="product-reviews__hint product-reviews__hint--ok">
            {lang === "en"
              ? "Thanks! You already reviewed this product."
              : "Terima kasih! Kamu sudah mereview produk ini."}
          </p>
        )}

        {/* Sudah login + belum review → FORM MUNCUL */}
        {isAuthenticated && !alreadyReviewed && (
          <form className="product-reviews__form" onSubmit={handleSubmit}>
            <h3>{lang === "en" ? "Write a review" : "Tulis Ulasanmu"}</h3>

            <div className="product-reviews__rating-row">
              <span>Rating</span>
              <Stars
                value={rating}
                size={22}
                interactive
                onChange={setRating}
              />
            </div>

            <textarea
              rows={4}
              placeholder={
                lang === "en"
                  ? "Share your experience with this product..."
                  : "Ceritakan pengalamanmu memakai produk ini..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            />

            <div className="product-reviews__form-footer">
              <span className="product-reviews__char">
                {comment.length}/500
              </span>
              <Button type="submit" variant="primary" size="md">
                {lang === "en" ? "Submit review" : "Kirim Ulasan"}
              </Button>
            </div>

            {error && <p className="product-reviews__error">{error}</p>}
            {success && (
              <p className="product-reviews__success">
                {lang === "en"
                  ? "Review submitted. Thank you!"
                  : "Ulasan berhasil dikirim. Terima kasih!"}
              </p>
            )}
          </form>
        )}
      </div>

      <div className="product-reviews__list">
        {reviews.length === 0 ? (
          <p className="product-reviews__empty">
            {t("product_no_reviews") || "Belum ada ulasan"}{" "}
            {lang === "en" ? "for this product." : "untuk produk ini."}
          </p>
        ) : (
          reviews.map((r) => (
            <article key={r.id} className="product-reviews__item">
              <div className="product-reviews__item-head">
                <div className="product-reviews__avatar">
                  {(r.userName || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{r.userName}</strong>
                  <div className="product-reviews__item-meta">
                    <Stars value={r.rating} size={14} />
                    <time>{formatDate(r.createdAt, lang)}</time>
                  </div>
                </div>
              </div>
              <p>{r.comment}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}