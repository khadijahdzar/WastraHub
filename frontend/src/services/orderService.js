import api from "../api/axios";

function toError(err, fallback) {
  const rawMessage = String(
    err?.response?.data?.message || err?.response?.data?.error || err?.message || ""
  );
  if (/SQLSTATE|connection refused|could not be made|mysql|personal_access_tokens/i.test(rawMessage)) {
    const safe = new Error("Layanan pembayaran sedang tidak tersedia. Silakan coba lagi.");
    safe.status = 503;
    safe.raw = err;
    return safe;
  }
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
    err.message?.includes("Network Error") ||
    err.response?.status === 503 ||
    /SQLSTATE|connection refused|could not be made|mysql|personal_access_tokens/i.test(
      String(err?.response?.data?.message || err?.message || "")
    )
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
 * Map status backend → tab frontend
 */
export function mapOrderStatus(status) {
  const s = String(status || "pending").toLowerCase();
  if (["pending", "unpaid", "menunggu"].includes(s)) return "belum-dibayar";
  if (["paid", "processing", "diproses", "confirmed"].includes(s)) return "belum-dikirim";
  if (["shipped", "dikirim", "delivering", "on_delivery"].includes(s)) return "belum-diterima";
  if (["completed", "done", "selesai", "delivered"].includes(s)) return "selesai";
  if (["cancelled", "canceled", "batal", "refund"].includes(s)) return "batal";
  return "belum-dibayar";
}

/**
 * Normalisasi order dari API / localStorage ke bentuk UI
 */
export function normalizeOrder(o) {
  if (!o) return null;
  const details = o.details || o.order_details || o.items || [];
  const items = details.map((d) => {
    const product = d.product || {};
    return {
      name: product.name || d.name || "Produk",
      qty: d.quantity ?? d.qty ?? 1,
      price: Number(d.price ?? product.price ?? 0),
      image:
        product.image_url ||
        product.image ||
        (Array.isArray(product.images) && product.images[0]) ||
        d.image ||
        "/images/products/placeholder.jpg",
      region: product.region?.name || product.region || d.region || "",
      product_id: d.product_id || product.id,
    };
  });

  const id = o.id;
  const code = o.order_number || o.code || `WH-${id}`;
  const total = Number(o.total_amount ?? o.total ?? o.grand_total ?? 0);
  const statusRaw = o.status || "pending";
  const status = mapOrderStatus(statusRaw);
  const payment = o.payment?.payment_method || o.payment_method || "—";
  const address = o.address || "—";
  const date = o.created_at || o.date || new Date().toISOString();

  return {
    id,
    code,
    date,
    status,
    statusRaw,
    total,
    subtotal: total,
    shipping: 0,
    payment,
    address,
    phone: o.phone || "",
    customer_name: o.customer_name || o.user?.name || "",
    tracking: o.tracking || o.tracking_number || null,
    items,
    raw: o,
  };
}

/**
 * POST /api/orders  (auth)
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
      order_number: `WH-LOCAL-${Date.now()}`,
      total_amount: payload.total_amount,
      status: "pending",
      customer_name: payload.customer_name,
      phone: payload.phone,
      address: payload.address,
      details: (payload.items || []).map((it) => ({
        product_id: it.product_id,
        quantity: it.quantity,
        price: it.price,
        subtotal: it.subtotal ?? it.price * it.quantity,
        product: { name: it.name, image: it.image, region: it.region },
      })),
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
 * POST /api/orders/{id}/pay  — konfirmasi pembayaran
 */
export async function payOrder(id) {
  try {
    const res = await api.post(`/orders/${id}/pay`);
    const body = res?.data ?? res;
    const order = body?.data ?? body;
    try {
      const notifs = JSON.parse(localStorage.getItem("wastrahub_admin_notifs") || "[]");
      notifs.unshift({
        id: Date.now(),
        type: "order_paid",
        order_id: order?.id,
        order_number: order?.order_number,
        message: `Pesanan ${order?.order_number || order?.id} sudah dibayar — perlu dikirim`,
        created_at: new Date().toISOString(),
        read: false,
      });
      localStorage.setItem("wastrahub_admin_notifs", JSON.stringify(notifs.slice(0, 50)));
      window.dispatchEvent(new CustomEvent("wastrahub:order-paid", { detail: order }));
    } catch {
      /* ignore */
    }
    return { data: normalizeOrder(order), source: "api", message: body?.message };
  } catch (err) {
    if (!isOffline(err) && err.response?.status !== 401) {
      throw toError(err, "Gagal memproses pembayaran");
    }
    if (err.response?.status === 401) {
      throw toError(err, "Silakan login terlebih dahulu");
    }
    console.warn("[orderService] pay offline → update localStorage");
    try {
      const prev = JSON.parse(localStorage.getItem("wastrahub_orders") || "[]");
      const idx = prev.findIndex(
        (o) => String(o.id) === String(id) || o.order_number === id
      );
      if (idx === -1) throw new Error("Pesanan tidak ditemukan");
      const updated = {
        ...prev[idx],
        status: "paid",
        payment: {
          ...(prev[idx].payment || {}),
          status: "paid",
          paid_at: new Date().toISOString(),
        },
      };
      prev[idx] = updated;
      localStorage.setItem("wastrahub_orders", JSON.stringify(prev));
      try {
        const notifs = JSON.parse(localStorage.getItem("wastrahub_admin_notifs") || "[]");
        notifs.unshift({
          id: Date.now(),
          type: "order_paid",
          order_id: updated.id,
          order_number: updated.order_number,
          message: `Pesanan ${updated.order_number || updated.id} sudah dibayar — perlu dikirim`,
          created_at: new Date().toISOString(),
          read: false,
        });
        localStorage.setItem("wastrahub_admin_notifs", JSON.stringify(notifs.slice(0, 50)));
        window.dispatchEvent(new CustomEvent("wastrahub:order-paid", { detail: updated }));
      } catch {
        /* ignore */
      }
      return { data: normalizeOrder(updated), source: "dummy", message: "Pembayaran berhasil (offline)" };
    } catch (e) {
      throw toError(e, "Gagal memproses pembayaran");
    }
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
    return { data: list.map(normalizeOrder).filter(Boolean), source: "api" };
  } catch (err) {
    if (!isOffline(err) && err.response?.status !== 401) {
      throw toError(err, "Gagal memuat pesanan");
    }
    console.warn("[orderService] fallback orders lokal");
    try {
      const prev = JSON.parse(localStorage.getItem("wastrahub_orders") || "[]");
      return { data: prev.map(normalizeOrder).filter(Boolean), source: "dummy" };
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
    return { data: normalizeOrder(order), source: "api" };
  } catch (err) {
    if (!isOffline(err) && err.response?.status !== 401) {
      throw toError(err, "Pesanan tidak ditemukan");
    }
    try {
      const prev = JSON.parse(localStorage.getItem("wastrahub_orders") || "[]");
      const found = prev.find(
        (o) => String(o.id) === String(id) || o.order_number === id
      );
      if (found) return { data: normalizeOrder(found), source: "dummy" };
    } catch {
      /* ignore */
    }
    throw new Error("Pesanan tidak ditemukan");
  }
}