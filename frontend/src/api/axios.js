import axios from "axios";

// Status memori internal untuk melacak kondisi backend
let isBackendOffline = false;
let lastCheckTime = 0;
const CHECK_INTERVAL = 15000; // Coba tes koneksi lagi setelah 15 detik

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  timeout: 3000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

function resolveToken(config) {
  const url = String(config.url || "");
  const base = String(config.baseURL || "");
  const full = `${base}${url}`;
  const isAdminCall =
    full.includes("/admin") ||
    url.startsWith("/admin") ||
    url.includes("/admin/");

  if (isAdminCall) {
    return localStorage.getItem("wastrahub_admin_token");
  }
  return (
    localStorage.getItem("wastrahub_user_token") ||
    localStorage.getItem("wastrahub_token")
  );
}

// REQUEST INTERCEPTOR: Short-Circuit SEBELUM nembak jaringan
api.interceptors.request.use((config) => {
  const token = resolveToken(config);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const now = Date.now();
  // Jika server terdeteksi offline dan belum melewati durasi interval, BATALKAN REQUEST LOKAL
  if (isBackendOffline && now - lastCheckTime < CHECK_INTERVAL) {
    // Membuat error khusus tanpa memicu HTTP Request Browser
    return Promise.reject({
      isSilentOffline: true,
      message: "Server currently offline (Circuit Breaker Active)",
    });
  }

  return config;
});

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    // Jika ada request yang berhasil, backend dianggap hidup kembali
    isBackendOffline = false;
    return response;
  },
  (error) => {
    // Jika error jaringan (server down / connection refused)
    if (
      error.code === "ERR_NETWORK" ||
      error.code === "ERR_CONNECTION_REFUSED" ||
      !error.response
    ) {
      isBackendOffline = true;
      lastCheckTime = Date.now();
    }

    if (error.response?.status === 401) {
      const url = String(error.config?.url || "");
      if (url.includes("/admin")) {
        if (localStorage.getItem("wastrahub_admin_token") === "dummy-admin-token") {
          return Promise.reject(error);
        }
        localStorage.removeItem("wastrahub_admin_token");
        localStorage.removeItem("wastrahub_admin_user");
        if (window.location.pathname.startsWith("/admin")) {
          window.location.replace("/admin/login");
        }
      } else {
        localStorage.removeItem("wastrahub_user_token");
        localStorage.removeItem("wastrahub_token");
        localStorage.removeItem("wastrahub_user");
      }
    }
    return Promise.reject(error);
  }
);

// Helper eksternal jika ingin mengecek status backend tanpa throw error
export const isServerOffline = () => isBackendOffline;

export default api;