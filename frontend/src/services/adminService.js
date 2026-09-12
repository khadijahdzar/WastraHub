import api from "../api/axios";
import {
  products as localProducts,
  categories as localCategories,
} from "../data/products";
import { getAllReviewsFlat } from "../utils/reviews";

function toError(err, fallback) {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    (err?.response?.data?.errors
      ? Object.values(err.response.data.errors).flat().join(" ")
      : null) ||
    err?.message ||
    fallback;
  const e = new Error(msg);
  e.status = err?.response?.status;
  e.raw = err;
  return e;
}

function isOffline(err) {
  return (
    !err.response ||
    err.code === "ERR_NETWORK" ||
    err.message?.includes("Network Error")
  );
}

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

/** Baca pesanan user dari localStorage (hasil checkout offline) */
function readLocalOrders() {
  try {
    const raw = JSON.parse(localStorage.getItem("wastrahub_orders") || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.map((o) => ({
      id: o.id,
      order_number: o.order_number || o.code || `WH-${o.id}`,
      total_amount: Number(o.total_amount ?? o.total ?? 0),
      status: o.status || "pending",
      customer_name: o.customer_name || "Pembeli",
      phone: o.phone || "",
      address: o.address || "",
      created_at: o.created_at || o.date || new Date().toISOString(),
      updated_at: o.updated_at || o.created_at || new Date().toISOString(),
      details: (o.details || o.items || []).map((d) => ({
        product_id: d.product_id,
        quantity: d.quantity ?? d.qty ?? 1,
        price: d.price,
        product: d.product || {
          name: d.name || "Produk",
          image: d.image,
        },
      })),
      payment: o.payment || null,
      user: o.user || null,
      _local: true,
    }));
  } catch {
    return [];
  }
}

function writeLocalOrders(list) {
  try {
    localStorage.setItem("wastrahub_orders", JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/* ========== PRODUCTS ========== */

function normalizeAdminProduct(product) {
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

export async function adminFetchProducts() {
  try {
    const res = await api.get("/admin/products");
    return { data: unwrapList(res).map(normalizeAdminProduct), source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal memuat produk");
    let extra = [];
    try {
      extra = JSON.parse(localStorage.getItem("wastrahub_admin_products") || "[]");
    } catch {
      extra = [];
    }
    return {
      data: [...extra, ...localProducts].map(normalizeAdminProduct),
      source: "local",
    };
  }
}

export async function adminCreateProduct(payload) {
  try {
    const res = await api.post("/admin/products", payload);
    return { data: unwrapOne(res), source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal menambah produk");
    const created = {
      id: Date.now(),
      ...payload,
      rating: 5,
      reviews: 0,
      image: payload.image || "/images/products/placeholder.jpg",
      created_at: new Date().toISOString(),
    };
    try {
      const prev = JSON.parse(localStorage.getItem("wastrahub_admin_products") || "[]");
      localStorage.setItem(
        "wastrahub_admin_products",
        JSON.stringify([created, ...prev])
      );
    } catch {
      /* ignore */
    }
    return { data: normalizeAdminProduct(created), source: "local" };
  }
}

export async function adminUpdateProduct(id, payload) {
  try {
    const res = await api.put(`/admin/products/${id}`, payload);
    return { data: unwrapOne(res), source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal update produk");
    try {
      const prev = JSON.parse(localStorage.getItem("wastrahub_admin_products") || "[]");
      const next = prev.map((p) =>
        String(p.id) === String(id) ? { ...p, ...payload, id } : p
      );
      localStorage.setItem("wastrahub_admin_products", JSON.stringify(next));
    } catch {
      /* ignore */
    }
    return { data: { id, ...payload }, source: "local" };
  }
}

export async function adminDeleteProduct(id) {
  try {
    await api.delete(`/admin/products/${id}`);
    return { source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal hapus produk");
    try {
      const prev = JSON.parse(localStorage.getItem("wastrahub_admin_products") || "[]");
      localStorage.setItem(
        "wastrahub_admin_products",
        JSON.stringify(prev.filter((p) => String(p.id) !== String(id)))
      );
    } catch {
      /* ignore */
    }
    return { source: "local" };
  }
}

/* ========== ORDERS ========== */

/**
 * Ambil pesanan admin: API dulu, lalu merge dengan localStorage user orders
 * agar badge notifikasi dan tabel Orders selalu sinkron.
 */
export async function adminFetchOrders() {
  let apiList = [];
  let source = "api";

  try {
    const res = await api.get("/admin/orders");
    apiList = unwrapList(res);
  } catch (err) {
    if (!isOffline(err) && err.response?.status !== 401 && err.response?.status !== 403) {
      throw toError(err, "Gagal memuat pesanan");
    }
    source = "local";
  }

  const localList = readLocalOrders();

  const map = new Map();
  for (const o of apiList) {
    map.set(String(o.id), o);
  }
  for (const o of localList) {
    if (!map.has(String(o.id))) {
      map.set(String(o.id), o);
    }
  }

  const merged = Array.from(map.values()).sort((a, b) => {
    const da = new Date(a.created_at || 0).getTime();
    const db = new Date(b.created_at || 0).getTime();
    return db - da;
  });

  if (apiList.length === 0 && localList.length > 0) source = "local";

  return { data: merged, source };
}

export async function adminUpdateOrderStatus(id, status) {
  try {
    const res = await api.patch(`/admin/orders/${id}/status`, { status });
    try {
      const prev = JSON.parse(localStorage.getItem("wastrahub_orders") || "[]");
      const idx = prev.findIndex(
        (o) => String(o.id) === String(id) || o.order_number === id
      );
      if (idx >= 0) {
        prev[idx] = { ...prev[idx], status };
        writeLocalOrders(prev);
      }
    } catch {
      /* ignore */
    }
    return { data: unwrapOne(res), source: "api" };
  } catch (err) {
    if (!isOffline(err) && err.response?.status !== 401) {
      throw toError(err, "Gagal update status pesanan");
    }
    try {
      const prev = JSON.parse(localStorage.getItem("wastrahub_orders") || "[]");
      const idx = prev.findIndex(
        (o) => String(o.id) === String(id) || o.order_number === id
      );
      if (idx >= 0) {
        prev[idx] = { ...prev[idx], status };
        writeLocalOrders(prev);
      }
    } catch {
      /* ignore */
    }
    return { data: { id, status }, source: "local" };
  }
}

export async function adminDeleteOrder(order) {
  const id = typeof order === "object" ? order.id : order;
  if (typeof order === "object" && order._local) {
    removeLocalOrder(id);
    return { source: "local" };
  }

  try {
    await api.delete(`/admin/orders/${id}`);
    removeLocalOrder(id);
    return { source: "api" };
  } catch (err) {
    if (!isOffline(err) && err.response?.status !== 401 && err.response?.status !== 403) {
      throw toError(err, "Gagal menghapus riwayat pesanan");
    }
    removeLocalOrder(id);
    return { source: "local" };
  }
}

function removeLocalOrder(id) {
  try {
    const previous = JSON.parse(localStorage.getItem("wastrahub_orders") || "[]");
    localStorage.setItem(
      "wastrahub_orders",
      JSON.stringify(
        previous.filter(
          (order) =>
            String(order.id) !== String(id) &&
            String(order.order_number || "") !== String(id)
        )
      )
    );
  } catch {
    /* ignore local storage failures */
  }
}

/* ========== REVIEWS ========== */

export async function adminFetchReviews() {
  try {
    const res = await api.get("/admin/reviews");
    const apiReviews = unwrapList(res);
    return {
      data: apiReviews.length > 0 ? apiReviews : getAllReviewsFlat(),
      source: apiReviews.length > 0 ? "api" : "local",
    };
  } catch (err) {
    if (!isOffline(err) && err.response?.status !== 401 && err.response?.status !== 403) {
      throw toError(err, "Gagal memuat ulasan");
    }
    return { data: getAllReviewsFlat(), source: "local" };
  }
}

export async function adminApproveReview(id) {
  try {
    const res = await api.patch(`/admin/reviews/${id}/approve`);
    return { data: unwrapOne(res), source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal approve ulasan");
    return { data: { id, approved: true }, source: "local" };
  }
}

export async function adminDeleteReview(id) {
  try {
    await api.delete(`/admin/reviews/${id}`);
    return { source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal hapus ulasan");
    return { source: "local" };
  }
}

/* ========== DASHBOARD STATS ========== */

export async function adminFetchStats() {
  try {
    const res = await api.get("/admin/stats");
    return { data: unwrapOne(res), source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal memuat statistik");
    const orders = readLocalOrders();
    let products = localProducts;
    try {
      const extra = JSON.parse(localStorage.getItem("wastrahub_admin_products") || "[]");
      products = [...extra, ...localProducts];
    } catch {
      /* ignore */
    }
    const revenue = orders
      .filter((o) => !["cancelled", "pending"].includes(String(o.status)))
      .reduce((s, o) => s + Number(o.total_amount || 0), 0);
    const customers = new Set(
      orders.map((o) => o.customer_name || o.phone).filter(Boolean)
    ).size;

    return {
      data: {
        revenue,
        orders: orders.length,
        customers,
        products: products.length,
        rating: "4.8",
      },
      source: "local",
    };
  }
}

export async function adminFetchReports() {
  try {
    const res = await api.get("/admin/reports");
    return { data: unwrapOne(res), source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal memuat laporan");

    const eligible = readLocalOrders().filter((order) =>
      ["paid", "processing", "shipped", "completed"].includes(
        String(order.status).toLowerCase()
      )
    );
    const daily = eligible.reduce((groups, order) => {
      const date = String(order.created_at).slice(0, 10);
      const group = groups[date] || { date, orders: 0, revenue: 0 };
      group.orders += 1;
      group.revenue += Number(order.total_amount || 0);
      groups[date] = group;
      return groups;
    }, {});
    const dailySales = Object.values(daily)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 15);

    return {
      data: {
        revenue: dailySales.reduce((sum, row) => sum + row.revenue, 0),
        orders: readLocalOrders().length,
        daily_sales: dailySales,
      },
      source: "local",
    };
  }
}

export { localCategories, readLocalOrders };