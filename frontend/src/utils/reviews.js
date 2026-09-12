const REVIEWS_KEY = "wastrahub_reviews";
const PURCHASED_KEY = "wastrahub_purchased";
const REVIEWS_EVENT = "wastrahub:reviews-updated";

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function notifyReviewsUpdated() {
  try {
    window.dispatchEvent(new CustomEvent(REVIEWS_EVENT, { detail: { at: Date.now() } }));
  } catch {}
}

const SEED_REVIEWS = {
  1: [
    {
      id: "r1",
      userId: "seed-1",
      userName: "Siti Rahayu",
      rating: 5,
      comment:
        "Kainnya bagus banget, motif parang-nya rapi. Pengiriman cepat dan packing aman.",
      createdAt: "2026-07-12T10:00:00.000Z",
    },
    {
      id: "r2",
      userId: "seed-2",
      userName: "Budi Santoso",
      rating: 4,
      comment:
        "Sesuai deskripsi. Warnanya agak lebih gelap dari foto, tapi overall puas.",
      createdAt: "2026-06-28T14:30:00.000Z",
    },
  ],
  2: [
    {
      id: "r3",
      userId: "seed-3",
      userName: "Dewi Lestari",
      rating: 5,
      comment: "Kawung-nya elegan, cocok untuk acara formal.",
      createdAt: "2026-07-01T09:15:00.000Z",
    },
  ],
};

export function getReviews(productId) {
  const all = read(REVIEWS_KEY, null);
  if (!all) {
    write(REVIEWS_KEY, SEED_REVIEWS);
    return SEED_REVIEWS[String(productId)] || [];
  }
  return all[String(productId)] || [];
}

/**
 * Semua review flat untuk Admin panel (dari localStorage).
 * Bentuk: { id, productId, product, name, rating, comment, approved, createdAt }
 */
export function getAllReviewsFlat(productNameMap = {}) {
  let all = read(REVIEWS_KEY, null);
  if (!all) {
    write(REVIEWS_KEY, SEED_REVIEWS);
    all = SEED_REVIEWS;
  }
  const list = [];
  Object.keys(all).forEach((pid) => {
    (all[pid] || []).forEach((r) => {
      list.push({
        id: r.id,
        productId: pid,
        product:
          productNameMap[pid] ||
          productNameMap[String(pid)] ||
          r.productName ||
          `Produk #${pid}`,
        name: r.userName || r.name || "Pengguna",
        rating: Number(r.rating) || 0,
        comment: r.comment || r.review || "",
        approved: r.approved !== false,
        createdAt: r.createdAt || null,
      });
    });
  });
  list.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
  return list;
}

export function addReview(productId, review) {
  const all = read(REVIEWS_KEY, { ...SEED_REVIEWS });
  const key = String(productId);
  const list = all[key] || [];
  const entry = {
    id: `r-${Date.now()}`,
    ...review,
    approved: review.approved !== false,
    createdAt: new Date().toISOString(),
  };
  all[key] = [entry, ...list];
  write(REVIEWS_KEY, all);
  notifyReviewsUpdated();
  return entry;
}

export function setReviewApproved(reviewId, approved = true) {
  const all = read(REVIEWS_KEY, {});
  let found = false;
  Object.keys(all).forEach((pid) => {
    all[pid] = (all[pid] || []).map((r) => {
      if (r.id === reviewId) {
        found = true;
        return { ...r, approved };
      }
      return r;
    });
  });
  if (found) {
    write(REVIEWS_KEY, all);
    notifyReviewsUpdated();
  }
  return found;
}

export function deleteReviewLocal(reviewId) {
  const all = read(REVIEWS_KEY, {});
  Object.keys(all).forEach((pid) => {
    all[pid] = (all[pid] || []).filter((r) => r.id !== reviewId);
  });
  write(REVIEWS_KEY, all);
  notifyReviewsUpdated();
}

export function onReviewsUpdated(handler) {
  const fn = () => handler();
  window.addEventListener(REVIEWS_EVENT, fn);
  window.addEventListener("storage", (e) => {
    if (e.key === REVIEWS_KEY) fn();
  });
  return () => {
    window.removeEventListener(REVIEWS_EVENT, fn);
  };
}

export function hasUserReviewed(productId, userId) {
  if (!userId) return false;
  return getReviews(productId).some(
    (r) => String(r.userId) === String(userId)
  );
}

export function markPurchased(userId, productIds) {
  if (!userId || !productIds?.length) return;
  const all = read(PURCHASED_KEY, {});
  const key = String(userId);
  const set = new Set(all[key] || []);
  productIds.forEach((id) => set.add(Number(id)));
  all[key] = Array.from(set);
  write(PURCHASED_KEY, all);
}

export function hasPurchased(userId, productId) {
  if (!userId) return false;
  const all = read(PURCHASED_KEY, {});
  const list = all[String(userId)] || [];
  return list.includes(Number(productId));
}

export function getAverageRating(productId) {
  const list = getReviews(productId);
  if (!list.length) return null;
  const sum = list.reduce((a, r) => a + Number(r.rating || 0), 0);
  return Math.round((sum / list.length) * 10) / 10;
}

export { REVIEWS_EVENT };
