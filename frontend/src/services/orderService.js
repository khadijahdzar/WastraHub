import api from "../api/axios";

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

/**
 * Bangun payment_method string dari form checkout
 */
export function buildPaymentMethod(form) {
  if (form.payment === "cod") return "cod";
  if (form.payment === "ewallet") return form.ewallet || "ewallet";
  if (form.payment === "transfer")
    return form.bank ? `transfer_${form.bank}` : "transfer";
  return form.payment || "transfer";
}

/**
 * POST /api/orders
 */
export async function createOrder(payload) {
  try {
    const res = await api.post("/orders", payload);
    const body = res?.data ?? res;
    const order = body?.data ?? body?.order ?? body;
    return { data: order, source: "api" };
  } catch (err) {
    if (!isOffline(err) && err.response?.status !== 401) {
      throw toError(err, "Gagal membuat pesanan");
    }
    if (err.response?.status === 401) {
      throw toError(err, "Silakan login terlebih dahulu");
    }
    console.warn("[orderService] API offline, simpan order ke localStorage");
    const localOrder = {
      id: Date.now(),
      order_number: payload.order_number || `WH-${Date.now()}`,
      total_amount: payload.total_amount,
      status: "pending",
      customer_name: payload.customer_name,
      phone: payload.phone,
      address: payload.address,
      items: payload.items,
      payment: {
        payment_method: payload.payment_method,
        amount: payload.total_amount,
        status: "pending",
      },
      created_at: new Date().toISOString(),
      source: "dummy",
    };
    try {
      const prev = JSON.parse(localStorage.getItem("wastrahub_orders") || "[]");
      localStorage.setItem(
        "wastrahub_orders",
        JSON.stringify([localOrder, ...prev])
      );
    } catch {
      /* ignore */
    }
    return { data: localOrder, source: "dummy" };
  }
}

/**
 * GET /api/orders
 */
export async function fetchOrders() {
  try {
    const res = await api.get("/orders");
    const body = res?.data ?? res;
    const list = Array.isArray(body) ? body : body?.data ?? [];
    return { data: list, source: "api" };
  } catch (err) {
    if (!isOffline(err) && err.response?.status !== 401) {
      throw toError(err, "Gagal memuat pesanan");
    }
    console.warn("[orderService] fallback orders lokal");
    try {
      const prev = JSON.parse(localStorage.getItem("wastrahub_orders") || "[]");
      return { data: prev, source: "dummy" };
    } catch {
      return { data: [], source: "dummy" };
    }
  }
}

/**
 * GET /api/orders/:id
 */
export async function fetchOrder(id) {
  try {
    const res = await api.get(`/orders/${id}`);
    const body = res?.data ?? res;
    const order = body?.data ?? body;
    return { data: order, source: "api" };
  } catch (err) {
    if (!isOffline(err) && err.response?.status !== 401) {
      throw toError(err, "Pesanan tidak ditemukan");
    }
    try {
      const prev = JSON.parse(localStorage.getItem("wastrahub_orders") || "[]");
      const found = prev.find(
        (o) => String(o.id) === String(id) || o.order_number === id
      );
      if (found) return { data: found, source: "dummy" };
    } catch {
      /* ignore */
    }
    throw new Error("Pesanan tidak ditemukan");
  }
}