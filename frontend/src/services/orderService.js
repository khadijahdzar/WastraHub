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
    !err ||
    !err.response ||
    err.code === "ERR_NETWORK" ||
    err.message?.includes("Network Error") ||
    err.response?.status === 503 ||
    /SQLSTATE|connection refused|could not be made|mysql|personal_access_tokens/i.test(
      String(err?.response?.data?.message || err?.message || "")
    )
  );
}

export function buildPaymentMethod(form) {
  if (form?.payment === "cod") return "cod";
  if (form?.payment === "ewallet") return form.ewallet || "ewallet";
  if (form?.payment === "transfer")
    return form.bank ? `transfer_${form.bank}` : "transfer";
  return form?.payment || "transfer";
}

export function mapOrderStatus(status) {
  const s = String(status || "pending").toLowerCase();
  if (["pending", "unpaid", "menunggu", "belum-dibayar"].includes(s)) return "belum-dibayar";
  if (["paid", "processing", "diproses", "confirmed", "belum-dikirim"].includes(s)) return "belum-dikirim";
  if (["shipped", "dikirim", "delivering", "on_delivery", "belum-diterima"].includes(s)) return "belum-diterima";
  if (["completed", "done", "selesai", "delivered"].includes(s)) return "selesai";
  if (["cancelled", "canceled", "batal", "refund"].includes(s)) return "batal";
  return "belum-dibayar";
}

export function normalizeOrder(o) {
  if (!o) return null;
  const details = o.details || o.order_details || o.items || [];
  const items = (Array.isArray(details) ? details : []).map((d) => {
    const product = d.product || {};
    const rawImage =
      product.image ||
      (Array.isArray(product.images) && product.images[0]) ||
      d.image ||
      product.image_url ||
      "";
    const image =
      rawImage &&
      !/^https?:\/\//.test(rawImage) &&
      !rawImage.startsWith("/") &&
      !rawImage.startsWith("data:")
        ? `/images/products/${rawImage}`
        : rawImage;

    return {
      name: product.name || d.name || "Produk Batik",
      qty: d.quantity ?? d.qty ?? 1,
      price: Number(d.price ?? product.price ?? 0),
      image: image || "/images/products/placeholder.jpg",
      region: product.region?.name || product.region || d.region || "",
      product_id: d.product_id || product.id,
    };
  });

  const id = o.id;
  const code = o.order_number || o.code || `WH-${id}`;
  const total = Number(o.total_amount ?? o.total ?? o.grand_total ?? 0);
  const statusRaw = o.status || "pending";
  const status = mapOrderStatus(statusRaw);
  const payment = o.payment?.payment_method || o.payment_method || "transfer";
  const address = o.address || "—";
  const parsedDate = new Date(o.created_at || o.date || Date.now());
  const date = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  return {
    id,
    code,
    order_number: code,
    date,
    created_at: date.toISOString(),
    status,
    statusRaw,
    total,
    total_amount: total,
    subtotal: total,
    shipping: 0,
    payment,
    paymentMethod: o.paymentMethod || payment,
    address,
    phone: o.phone || "",
    customer_name: o.customer_name || o.user?.name || "Pembeli",
    customer_email: o.user?.email || o.customer_email || o.email || "",
    items,
    details: items,
    raw: o,
  };
}

export function readLocalOrders() {
  try {
    const raw1 = JSON.parse(localStorage.getItem("wastrahub_orders") || "[]");
    const raw2 = JSON.parse(localStorage.getItem("wastrahub_user_orders") || "[]");
    const combined = [...(Array.isArray(raw1) ? raw1 : []), ...(Array.isArray(raw2) ? raw2 : [])];
    const map = new Map();
    for (const item of combined) {
      if (!item) continue;
      const key = String(item.id || item.code || item.order_number);
      if (!map.has(key)) {
        map.set(key, normalizeOrder(item));
      }
    }
    return Array.from(map.values()).filter(Boolean);
  } catch {
    return [];
  }
}

export function writeLocalOrders(list) {
  try {
    const json = JSON.stringify(list);
    localStorage.setItem("wastrahub_orders", json);
    localStorage.setItem("wastrahub_user_orders", json);
  } catch {
    /* ignore */
  }
}

export function broadcastSync(eventName, detail) {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
  if (typeof BroadcastChannel !== "undefined") {
    try {
      const bc = new BroadcastChannel("wastrahub_sync");
      bc.postMessage({ type: eventName, detail, time: Date.now() });
      bc.close();
    } catch {
      /* ignore */
    }
  }
  try {
    localStorage.setItem(
      "wastrahub_last_sync",
      JSON.stringify({ type: eventName, detail, time: Date.now() })
    );
  } catch {
    /* ignore */
  }
}

export async function createOrder(payload) {
  try {
    const res = await api.post("/orders", payload);
    const body = res?.data ?? res;
    const order = normalizeOrder(body?.data ?? body?.order ?? body);
    
    const prev = readLocalOrders();
    writeLocalOrders([order, ...prev]);

    broadcastSync("wastrahub:order-created", order);
    return { data: order, source: "api" };
  } catch (err) {
    if (!isOffline(err) && err.response?.status !== 401) {
      throw toError(err, "Gagal membuat pesanan");
    }

    const isCod = String(payload.payment_method || payload.payment || "").toLowerCase().includes("cod");
    const localOrder = normalizeOrder({
      id: Date.now(),
      order_number: `WH-LOCAL-${Date.now()}`,
      total_amount: payload.total_amount,
      status: isCod ? "belum-dikirim" : "belum-dibayar",
      statusRaw: isCod ? "processing" : "pending",
      payment_method: payload.payment_method || payload.payment || "transfer",
      paymentMethod: payload.payment_method || payload.payment || "transfer",
      customer_name: payload.customer_name || "Pembeli",
      customer_email: payload.customer_email || payload.email || "",
      phone: payload.phone,
      address: payload.address,
      items: payload.items || [],
      created_at: new Date().toISOString(),
    });

    const prev = readLocalOrders();
    writeLocalOrders([localOrder, ...prev]);

    broadcastSync("wastrahub:order-created", localOrder);
    return { data: localOrder, source: "dummy" };
  }
}

export async function payOrder(id) {
  try {
    const res = await api.post(`/orders/${id}/pay`);
    const body = res?.data ?? res;
    const order = normalizeOrder(body?.data ?? body);
    
    const prev = readLocalOrders();
    const idx = prev.findIndex((o) => String(o.id) === String(id) || String(o.code) === String(id) || String(o.order_number) === String(id));
    if (idx >= 0) {
      prev[idx].status = "belum-dikirim";
      prev[idx].statusRaw = "paid";
      writeLocalOrders(prev);
    }
    broadcastSync("wastrahub:order-paid", order || prev[idx]);
    return { data: order, source: "api", message: body?.message };
  } catch (err) {
    if (!isOffline(err) && err.response?.status !== 401) {
      throw toError(err, "Gagal memproses pembayaran");
    }

    const prev = readLocalOrders();
    const idx = prev.findIndex((o) => String(o.id) === String(id) || String(o.code) === String(id) || String(o.order_number) === String(id));
    if (idx >= 0) {
      prev[idx].status = "belum-dikirim";
      prev[idx].statusRaw = "paid";
      writeLocalOrders(prev);
      broadcastSync("wastrahub:order-paid", prev[idx]);
      return { data: prev[idx], source: "dummy", message: "Pembayaran berhasil (offline)" };
    }
    throw toError(err, "Pesanan tidak ditemukan");
  }
}

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
    return { data: readLocalOrders(), source: "dummy" };
  }
}

export async function fetchOrder(id) {
  try {
    const res = await api.get(`/orders/${id}`);
    const body = res?.data ?? res;
    return { data: normalizeOrder(body?.data ?? body), source: "api" };
  } catch (err) {
    const found = readLocalOrders().find(
      (o) => String(o.id) === String(id) || String(o.code) === String(id)
    );
    if (found) return { data: found, source: "dummy" };
    throw new Error("Pesanan tidak ditemukan");
  }
}