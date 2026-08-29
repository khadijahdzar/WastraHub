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

/**
 * Login ke Laravel (POST /api/login).
 * Fallback dummy jika backend offline — agar UI tetap bisa dicoba.
 */
export async function loginRequest(email, password) {
  if (!email || !password) {
    throw new Error("Email dan password wajib diisi");
  }

  try {
    const res = await api.post("/login", { email, password });
    const { user, token } = extractAuthPayload(res);
    return { data: { user, token }, source: "api" };
  } catch (err) {
    const offline =
      !err.response ||
      err.code === "ERR_NETWORK" ||
      err.message?.includes("Network Error");

    if (offline) {
      console.warn("[authService] API offline, pakai login dummy");
      return {
        data: {
          user: {
            id: 1,
            name: "Pengguna WastraHub",
            email,
            role: "user",
            avatar: null,
          },
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
      console.warn("[authService] API offline, pakai register dummy");
      return {
        data: {
          user: {
            id: Date.now(),
            name: payload.name,
            email: payload.email,
            role: "user",
            avatar: null,
          },
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