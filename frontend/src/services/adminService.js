import api from "../api/axios";
import { products as localProducts, categories as localCategories } from "../data/products";
import { getAllReviewsFlat } from "../utils/reviews";
import { readLocalOrders, writeLocalOrders, normalizeOrder, mapOrderStatus } from "./orderService";

// RE-EXPORT agar komponen lama yang memanggil fungsi user lewat adminService tidak crash
export * from "./orderService";

function unwrapList(res) {
  const body = res?.data ?? res;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return [];
}

function unwrapOne(res) {
  const body = res?.data ?? res;
  if (body?.data && !Array.isArray(body.data)) return body.data;
  return body;
}

function normalizeAdminProduct(product) {
  if (!product) return null;
  const rawImage = product.image_url || product.image || "";
  const image =
    rawImage.startsWith("http://") ||
    rawImage.startsWith("https://") ||
    rawImage.startsWith("/") ||
    rawImage.startsWith("data:")
      ? rawImage
      : rawImage
        ? `/images/products/${rawImage}`
        : "";
  return { ...product, image, image_url: product.image_url || image };
}

function mergeProductsById(...lists) {
  const map = new Map();
  for (const list of lists) {
    for (const p of list || []) {
      if (p == null || p.id == null) continue;
      const key = String(p.id);
      const normalized = normalizeAdminProduct(p);
      if (!map.has(key)) map.set(key, normalized);
    }
  }
  return Array.from(map.values()).sort((a, b) => Number(b.id) - Number(a.id));
}

/* ========== PRODUCTS ========== */

export async function adminFetchProducts() {
  let apiList = [];
  let source = "api";
  try {
    const res = await api.get("/admin/products", { params: { all: 1, per_page: 200 } });
    apiList = unwrapList(res).map(normalizeAdminProduct);
  } catch {
    source = "local";
  }

  let extra = [];
  try {
    extra = JSON.parse(localStorage.getItem("wastrahub_admin_products") || "[]");
  } catch {
    extra = [];
  }

  const merged = mergeProductsById(apiList, extra, localProducts);
  return { data: merged, source, total: merged.length };
}

export async function adminCreateProduct(payload) {
  try {
    const res = await api.post("/admin/products", payload);
    return { data: normalizeAdminProduct(unwrapOne(res)), source: "api" };
  } catch {
    const created = normalizeAdminProduct({ id: Date.now(), ...payload, rating: 5, reviews: 0 });
    return { data: created, source: "local" };
  }
}

export async function adminUpdateProduct(id, payload) {
  try {
    const res = await api.put(`/admin/products/${id}`, payload);
    return { data: normalizeAdminProduct(unwrapOne(res)), source: "api" };
  } catch {
    return { data: normalizeAdminProduct({ id, ...payload }), source: "local" };
  }
}

export async function adminDeleteProduct(id) {
  try {
    await api.delete(`/admin/products/${id}`);
    return { source: "api" };
  } catch {
    return { source: "local" };
  }
}

/* ========== ORDERS & STATS ========== */

export async function adminFetchOrders() {
  let apiList = [];
  let source = "api";

  try {
    const res = await api.get("/admin/orders");
    apiList = unwrapList(res).map(normalizeOrder).filter(Boolean);
  } catch {
    source = "local";
  }

  const localList = readLocalOrders();
  const map = new Map();

  for (const o of localList) {
    if (o?.id) map.set(String(o.id), o);
  }
  for (const o of apiList) {
    if (o?.id) map.set(String(o.id), o);
  }

  const merged = Array.from(map.values()).sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return { data: merged, source };
}

export async function adminFetchStats() {
  let apiStats = null;
  try {
    const res = await api.get("/admin/stats");
    apiStats = unwrapOne(res);
  } catch {
    /* Fallback local */
  }

  const { data: allOrders } = await adminFetchOrders();
  const revenue = allOrders
    .filter((o) => o.status !== "batal")
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const customers = new Set(allOrders.map((o) => o.customer_name || o.phone).filter(Boolean)).size;

  return {
    data: {
      revenue: apiStats?.revenue ?? revenue,
      orders: allOrders.length,
      total_orders: allOrders.length,
      customers: apiStats?.customers || customers || 1,
      products: apiStats?.products || localProducts.length,
      rating: apiStats?.rating || "4.8",
      recent_orders: allOrders.slice(0, 5),
    },
    source: apiStats ? "api" : "local",
  };
}

export async function adminFetchReports() {
  try {
    const res = await api.get("/admin/reports");
    return { data: unwrapOne(res), source: "api" };
  } catch {
    const orders = readLocalOrders();
    return {
      data: {
        revenue: orders.reduce((s, o) => s + Number(o.total_amount || 0), 0),
        orders: orders.length,
        daily_sales: [],
      },
      source: "local",
    };
  }
}

export async function adminUpdateOrderStatus(id, status) {
  const nextStatus = mapOrderStatus(status);
  try {
    const res = await api.patch(`/admin/orders/${id}/status`, { status: nextStatus });
    const prev = readLocalOrders();
    const idx = prev.findIndex((o) => String(o.id) === String(id));
    if (idx >= 0) {
      prev[idx].status = nextStatus;
      writeLocalOrders(prev);
    }
    return { data: unwrapOne(res), source: "api" };
  } catch {
    const prev = readLocalOrders();
    const idx = prev.findIndex((o) => String(o.id) === String(id));
    if (idx >= 0) {
      prev[idx].status = nextStatus;
      writeLocalOrders(prev);
    }
    return { data: { id, status: nextStatus }, source: "local" };
  }
}

export async function adminDeleteOrder(order) {
  const id = typeof order === "object" ? order.id : order;
  try {
    await api.delete(`/admin/orders/${id}`);
    return { source: "api" };
  } catch {
    return { source: "local" };
  }
}

/* ========== REVIEWS ========== */

export async function adminFetchReviews() {
  try {
    const res = await api.get("/admin/reviews");
    const list = unwrapList(res);
    return { data: list.length > 0 ? list : getAllReviewsFlat(), source: list.length > 0 ? "api" : "local" };
  } catch {
    return { data: getAllReviewsFlat(), source: "local" };
  }
}

export async function adminApproveReview(id) {
  try {
    const res = await api.patch(`/admin/reviews/${id}/approve`);
    return { data: unwrapOne(res), source: "api" };
  } catch {
    return { data: { id, approved: true }, source: "local" };
  }
}

export async function adminDeleteReview(id) {
  try {
    await api.delete(`/admin/reviews/${id}`);
    return { source: "api" };
  } catch {
    return { source: "local" };
  }
}

export { localCategories };