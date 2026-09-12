import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  timeout: 10000,
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

api.interceptors.request.use((config) => {
  const token = resolveToken(config);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = String(error.config?.url || "");
      if (url.includes("/admin")) {
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

export default api;