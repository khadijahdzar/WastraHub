import api from "../api/axios";

function extractAuthPayload(res) {
  const body = res?.data ?? res;
  const data = body?.data ?? body;
  const user = data?.user ?? body?.user ?? null;
  const token =
    data?.token ??
    data?.access_token ??
    body?.token ??
    body?.access_token ??
    null;
  if (!user || !token) {
    throw new Error("Respons login tidak valid (user/token tidak ditemukan)");
  }
  return { user, token };
}

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

const LOCAL_USERS_KEY = "wastrahub_registered_users";

function readLocalUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function writeLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

async function hashPassword(password) {
  if (!globalThis.crypto?.subtle || typeof TextEncoder === "undefined") {
    throw new Error("Browser tidak mendukung penyimpanan akun offline yang aman");
  }
  const data = new TextEncoder().encode(password);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function userFromLocalRecord(record) {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: "user",
    avatar: null,
  };
}

/**
 * Login ke Laravel (POST /api/login).
 * Saat API offline, hanya akun yang pernah didaftarkan yang boleh login.
 */
export async function loginRequest(email, password, options = {}) {
  if (!email || !password) {
    throw new Error("Email dan password wajib diisi");
  }

  try {
    const res = await api.post("/login", { email, password });
    const { user, token } = extractAuthPayload(res);
    return { data: { user, token }, source: "api" };
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 422) {
      throw new Error("Akun belum terdaftar atau password salah. Silakan daftar dahulu.");
    }
    const offline =
      !err.response ||
      err.code === "ERR_NETWORK" ||
      err.message?.includes("Network Error");

    if (offline) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (options.role === "admin") {
        throw new Error("Server admin tidak tersedia. Jalankan backend lalu coba lagi.");
      }
      const passwordHash = await hashPassword(password);
      const registered = readLocalUsers().find(
        (user) => user.email === normalizedEmail && user.passwordHash === passwordHash
      );
      if (!registered) {
        throw new Error("Akun belum terdaftar atau password salah. Silakan daftar terlebih dahulu.");
      }
      return {
        data: {
          user: userFromLocalRecord(registered),
          token: "dummy-token-" + Date.now(),
        },
        source: "dummy",
      };
    }
    throw toError(err, "Login gagal");
  }
}

/**
 * Register ke Laravel (POST /api/register).
 */
export async function registerRequest(payload) {
  const body = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    password_confirmation: payload.password_confirmation || payload.password,
  };

  try {
    const res = await api.post("/register", body);
    const { user, token } = extractAuthPayload(res);
    return { data: { user, token }, source: "api" };
  } catch (err) {
    const offline =
      !err.response ||
      err.code === "ERR_NETWORK" ||
      err.message?.includes("Network Error");

    if (offline) {
      const normalizedEmail = String(payload.email || "").trim().toLowerCase();
      const users = readLocalUsers();
      if (users.some((user) => user.email === normalizedEmail)) {
        throw new Error("Email sudah terdaftar");
      }
      const record = {
        id: Date.now(),
        name: String(payload.name || "").trim(),
        email: normalizedEmail,
        passwordHash: await hashPassword(payload.password),
      };
      writeLocalUsers([...users, record]);
      return {
        data: {
          user: userFromLocalRecord(record),
          token: "dummy-token-" + Date.now(),
        },
        source: "dummy",
      };
    }
    throw toError(err, "Registrasi gagal");
  }
}

/**
 * Logout (POST /api/logout) — butuh Bearer token.
 */
export async function logoutRequest() {
  try {
    await api.post("/logout");
    return { data: { message: "Logged out" }, source: "api" };
  } catch (err) {
    console.warn("[authService] logout API gagal/offline, clear local saja");
    return { data: { message: "Logged out" }, source: "dummy" };
  }
}