import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import Badge from "../common/Badge";
import ImageWithFallback from "../common/ImageWithFallback";
import { formatPrice } from "../../data/products";
import { resolveProductImage } from "../../utils/productData";
import { useLanguage } from "../../context/LanguageContext";
import "./product-card.css";

export default function ProductCard({ product }) {
  const { t } = useLanguage();

  if (!product) return null;

  const {
    id,
    name,
    price,
    originalPrice,
    region,
    category,
    isNew,
    rating,
  } = product;

  // Memanggil utility resolver gambar dengan fallback default batik
  const rawImageSrc = resolveProductImage(product);
  const fallbackImage = "/images/categories/batikmodern.webp"; // Placeholder default yang elegan
  const imageSrc = rawImageSrc || fallbackImage;

  return (
    <article className="product-card">
      <Link
        to={`/product/${id}`}
        state={{ product }}
        className="product-card__media"
      >
        <div className="product-card__image-wrap">
          <ImageWithFallback
            src={imageSrc}
            fallbackSrc={fallbackImage}
            alt={name ?? "Produk WastraHub"}
            loading="eager"
            fetchPriority="high"
          />
        </div>
        {isNew && (
          <span className="product-card__badge">
            <Badge variant="new">{t("product_new")}</Badge>
          </span>
        )}
        <button
          type="button"
          className="product-card__wishlist"
          aria-label={t("product_wishlist")}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Heart size={18} />
        </button>
      </Link>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="product-card__region">{region ?? "-"}</span>
          <span className="product-card__dot">·</span>
          <span className="product-card__category">{category ?? "-"}</span>
        </div>

        <Link
          to={`/product/${id}`}
          state={{ product }}
          className="product-card__title"
        >
          {name ?? "Nama Produk Tidak Tersedia"}
        </Link>

        <div className="product-card__footer">
          <div className="product-card__price">
            <span className="product-card__price-current">
              {formatPrice(price ?? 0)}
            </span>
            {originalPrice && (
              <span className="product-card__price-original">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          {rating != null && (
            <div className="product-card__rating">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="#BB9457"
                aria-hidden
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{rating}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}