import api from "../api/axios";
import {
  products as localProducts,
  categories as localCategories,
} from "../data/products";

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

export async function adminFetchProducts() {
  try {
    const res = await api.get("/admin/products");
    return { data: unwrapList(res), source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal memuat produk");
    console.warn("[adminService] products offline");
    return { data: localProducts, source: "dummy" };
  }
}

export async function adminCreateProduct(payload) {
  try {
    const res = await api.post("/admin/products", payload);
    return { data: unwrapOne(res), source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal menambah produk");
    return {
      data: { id: Date.now(), ...payload, rating: 5, reviews: 0 },
      source: "dummy",
    };
  }
}

export async function adminUpdateProduct(id, payload) {
  try {
    const res = await api.put(`/admin/products/${id}`, payload);
    return { data: unwrapOne(res), source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal update produk");
    return { data: { id, ...payload }, source: "dummy" };
  }
}

export async function adminDeleteProduct(id) {
  try {
    await api.delete(`/admin/products/${id}`);
    return { source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal hapus produk");
    return { source: "dummy" };
  }
}

export async function adminFetchOrders() {
  try {
    const res = await api.get("/admin/orders");
    return { data: unwrapList(res), source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal memuat pesanan");
    return { data: [], source: "dummy" };
  }
}

export async function adminUpdateOrderStatus(id, status) {
  try {
    const res = await api.patch(`/admin/orders/${id}/status`, { status });
    return { data: unwrapOne(res), source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal update status pesanan");
    return { data: { id, status }, source: "dummy" };
  }
}

export async function adminFetchReviews() {
  try {
    const res = await api.get("/admin/reviews");
    return { data: unwrapList(res), source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal memuat ulasan");
    return { data: [], source: "dummy" };
  }
}

export async function adminApproveReview(id) {
  try {
    const res = await api.patch(`/admin/reviews/${id}/approve`);
    return { data: unwrapOne(res), source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal approve ulasan");
    return { data: { id, approved: true }, source: "dummy" };
  }
}

export async function adminDeleteReview(id) {
  try {
    await api.delete(`/admin/reviews/${id}`);
    return { source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal hapus ulasan");
    return { source: "dummy" };
  }
}

export async function adminFetchStats() {
  try {
    const res = await api.get("/admin/stats");
    return { data: unwrapOne(res), source: "api" };
  } catch (err) {
    if (!isOffline(err)) throw toError(err, "Gagal memuat statistik");
    return {
      data: {
        revenue: 0,
        orders: 0,
        products: localProducts.length,
        rating: "—",
      },
      source: "dummy",
    };
  }
}

export { localCategories };