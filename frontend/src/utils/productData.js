// Mengambil base URL API dari .env atau default ke localhost:8000
const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/api\/?$/, "");

/** Path relatif placeholder di public frontend */
const PLACEHOLDER = "/images/products/placeholder.jpg";

/**
 * Resolve URL gambar produk secara aman.
 * @param {Object|string} productOrPath - Object produk atau string path gambar
 * @param {Object} options - Konfigurasi tambahan
 * @param {boolean} options.isFallback - Flag penanda jika aplikasi dalam mode offline/fallback data
 */
export function resolveProductImage(productOrPath, options = {}) {
  // Ubah default isFallback jadi true jika pakai data lokal statis (products.js)
  const { isFallback = true } = options;

  if (!productOrPath) return PLACEHOLDER;

  // Ekstrak string image dari berbagai kemungkinan struktur objek/property
  let raw =
    typeof productOrPath === "string"
      ? productOrPath
      : productOrPath?.image_url ||
        productOrPath?.image ||
        (Array.isArray(productOrPath?.images) ? productOrPath.images[0] : null) ||
        "";

  if (!raw || typeof raw !== "string") return PLACEHOLDER;
  raw = raw.trim();

  // 1. Data URI (base64/inline SVG) — tidak butuh network fetch
  if (raw.startsWith("data:")) return raw;

  // 2. URL Absolut Lengkap (misal dari CDN/Cloudinary/External)
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    if (isFallback && raw.includes("localhost:8000")) {
      const filenameOnly = raw.replace(/^.*\//, "");
      return `/images/products/${filenameOnly}`;
    }
    return raw;
  }

  // 3. Path Relatif Frontend Lokal (Dimulai dengan /images/ atau /assets/)
  if (raw.startsWith("/images/") || raw.startsWith("/assets/")) {
    return raw;
  }

  // 4. Ambil nama filenya saja untuk dipetakan
  const filename = raw.replace(/^.*\//, "");
  if (!filename) return PLACEHOLDER;

  // 5. JIKA MODE FALLBACK / LOKAL AKTIF:
  // Selalu arahkan langsung ke folder public frontend agar aman tanpa backend
  if (isFallback) {
    if (raw.includes("categories")) return `/images/categories/${filename}`;
    if (raw.includes("regions")) return `/images/regions/${filename}`;
    return `/images/products/${filename}`;
  }

  // 6. JIKA BACKEND ONLINE:
  if (raw.includes("categories")) {
    return `${API_BASE}/images/categories/${filename}`;
  }
  if (raw.includes("regions")) {
    return `${API_BASE}/images/regions/${filename}`;
  }

  return `${API_BASE}/images/products/${filename}`;
}

/**
 * Normalisasi 1 objek produk agar struktur propertinya konsisten di seluruh komponen UI
 * @param {Object} p - Object produk raw
 * @param {Object} options - Parameter tambahan termasuk flag isFallback
 */
export function normalizeProduct(p, options = {}) {
  if (!p || typeof p !== "object") return null;

  const imageUrl = resolveProductImage(p, options);
  
  const images =
    Array.isArray(p?.images) && p.images.length > 0
      ? p.images.map((img) =>
          typeof img === "string"
            ? resolveProductImage(img, options)
            : resolveProductImage(img?.url || img?.image || img, options)
        )
      : [imageUrl];

  const regionName =
    typeof p?.region === "string"
      ? p.region
      : p?.region?.name || p?.region_name || "";

  const categoryName =
    typeof p?.category === "string"
      ? p.category
      : p?.category?.name || p?.category_name || p?.type || "";

  return {
    ...p,
    id: p?.id ?? Math.random(),
    name: p?.name || "Produk Wastra",
    slug: p?.slug || "",
    price: Number(p?.price) || 0,
    originalPrice: p?.originalPrice ?? p?.original_price ?? null,
    stock: Number(p?.stock) || 0,
    description: p?.description || "",
    material: p?.material || "",
    technique:
      p?.technique ||
      (p?.type ? String(p.type).replace(/^Batik\s+/i, "") : ""),
    type: p?.type || "",
    status: p?.status || "active",
    rating: p?.rating ?? 4.5,
    isNew: Boolean(p?.isNew ?? p?.is_new),
    isFeatured: Boolean(p?.isFeatured ?? p?.is_featured),
    category_id: p?.category_id ?? null,
    region_id: p?.region_id ?? null,
    category: categoryName,
    region: regionName,
    image: imageUrl,
    image_url: imageUrl,
    images,
  };
}

/**
 * Helper untuk menggabungkan dua array produk tanpa duplikasi ID
 */
export function mergeProducts(base = [], extra = []) {
  const map = new Map();
  for (const p of base || []) {
    if (p?.id == null) continue;
    map.set(String(p.id), p);
  }
  for (const p of extra || []) {
    if (p?.id == null) continue;
    const key = String(p.id);
    const prev = map.get(key);
    map.set(key, prev ? { ...prev, ...p } : p);
  }
  return Array.from(map.values());
}

/**
 * Helper untuk memfilter produk unggulan (Featured)
 */
export function filterFeatured(list = []) {
  if (!Array.isArray(list)) return [];
  const featured = list.filter((p) => Boolean(p?.isFeatured || p?.is_featured));
  if (featured.length > 0) return featured.slice(0, 12);
  return list.slice(0, 8);
}

export { PLACEHOLDER };