import api, { isServerOffline } from "../api/axios";
import {
  products,
  getProductById,
  filterProducts,
  getFeaturedProducts,
} from "../data/products";
import {
  filterFeatured,
  mergeProducts,
  normalizeProduct,
} from "../utils/productData";

// Helper internal untuk normalisasi array dari API
function normalizeList(response, options = {}) {
  const data = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(data)
    ? data.map((item) => normalizeProduct(item, options))
    : [];
}

// Read data lokal buatan admin dari localStorage secara aman
function readLocalAdminProducts() {
  try {
    const stored = JSON.parse(
      localStorage.getItem("wastrahub_admin_products") || "[]"
    );
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function isRequestAborted(error) {
  return (
    error?.name === "AbortError" ||
    error?.name === "CanceledError" ||
    error?.code === "ERR_CANCELED"
  );
}

/**
 * Fetch daftar produk umum dengan fallback data lokal jika HTTP 503 / Server Error / Offline
 */
export async function fetchProducts(params = {}) {
  const { signal, ...query } = params;
  const fallbackOptions = { isFallback: true };

  // PRE-CHECK: Jika server sudah diketahui offline, LANGSUNG lempar data lokal tanpa api.get()
  if (isServerOffline()) {
    return {
      data: mergeProducts(
        filterProducts(query).map((p) => normalizeProduct(p, fallbackOptions)),
        readLocalAdminProducts().map((p) => normalizeProduct(p, fallbackOptions))
      ),
      source: "local",
      isFallback: true,
      errorStatus: 503,
    };
  }

  try {
    const response = await api.get("/products", {
      params: { per_page: 20, ...query },
      signal,
    });

    const apiProducts = normalizeList(response, { isFallback: false });
    const catalogProducts = (products ?? []).map((p) =>
      normalizeProduct(p, { isFallback: false })
    );
    const localProducts = readLocalAdminProducts().map((p) =>
      normalizeProduct(p, { isFallback: false })
    );

    return {
      data: mergeProducts(
        mergeProducts(catalogProducts, apiProducts),
        localProducts
      ),
      source: "api",
      isFallback: false,
      errorStatus: null,
    };
  } catch (err) {
    if (isRequestAborted(err)) throw err;
    if (err.response?.status === 401 || err.response?.status === 403) throw err;

    // SILENT FALLBACK: Dihapus total tanpa console.warn

    return {
      data: mergeProducts(
        filterProducts(query).map((p) => normalizeProduct(p, fallbackOptions)),
        readLocalAdminProducts().map((p) => normalizeProduct(p, fallbackOptions))
      ),
      source: "local",
      isFallback: true,
      errorStatus: err.response?.status ?? 503,
    };
  }
}

/**
 * Fetch produk tunggal berdasarkan ID
 */
export async function fetchProduct(id, options = {}) {
  const fallbackOptions = { isFallback: true };

  if (isServerOffline()) {
    const localAdminProduct = readLocalAdminProducts().find(
      (item) => String(item?.id) === String(id)
    );
    const product = localAdminProduct
      ? normalizeProduct(localAdminProduct, fallbackOptions)
      : normalizeProduct(getProductById(id), fallbackOptions);

    return {
      data: product,
      source: "local",
      isFallback: true,
      errorStatus: 503,
    };
  }

  try {
    const response = await api.get(`/products/${id}`, {
      signal: options?.signal,
    });
    
    const apiProduct = response?.data?.data ?? response?.data;
    const localAdminProduct = readLocalAdminProducts().find(
      (item) => String(item?.id) === String(id)
    );
    
    const product = localAdminProduct
      ? { ...apiProduct, ...localAdminProduct }
      : apiProduct;

    return {
      data: normalizeProduct(product, { isFallback: false }),
      source: localAdminProduct ? "local" : "api",
      isFallback: false,
      errorStatus: null,
    };
  } catch (err) {
    if (isRequestAborted(err)) throw err;
    if (err.response?.status === 401 || err.response?.status === 403) throw err;

    const localAdminProduct = readLocalAdminProducts().find(
      (item) => String(item?.id) === String(id)
    );
    const product = localAdminProduct
      ? normalizeProduct(localAdminProduct, fallbackOptions)
      : normalizeProduct(getProductById(id), fallbackOptions);

    if (!product) {
      throw new Error("Product not found in local/mock database");
    }

    return {
      data: product,
      source: "local",
      isFallback: true,
      errorStatus: err.response?.status ?? 503,
    };
  }
}

/**
 * Fetch produk unggulan (Featured)
 */
export async function fetchFeatured(options = {}) {
  const { signal } = options;
  const fallbackOptions = { isFallback: true };

  if (isServerOffline()) {
    return {
      data: filterFeatured(
        mergeProducts(
          (getFeaturedProducts() ?? []).map((p) =>
            normalizeProduct(p, fallbackOptions)
          ),
          readLocalAdminProducts().map((p) =>
            normalizeProduct(p, fallbackOptions)
          )
        )
      ),
      source: "local",
      isFallback: true,
      errorStatus: 503,
    };
  }

  try {
    const response = await api.get("/products", {
      params: { featured: 1, per_page: 12 },
      signal,
    });

    const list = normalizeList(response, { isFallback: false });
    const local = readLocalAdminProducts().map((p) =>
      normalizeProduct(p, { isFallback: false })
    );

    return {
      data: filterFeatured(mergeProducts(list, local)),
      source: "api",
      isFallback: false,
      errorStatus: null,
    };
  } catch (err) {
    if (isRequestAborted(err)) throw err;

    return {
      data: filterFeatured(
        mergeProducts(
          (getFeaturedProducts() ?? []).map((p) =>
            normalizeProduct(p, fallbackOptions)
          ),
          readLocalAdminProducts().map((p) =>
            normalizeProduct(p, fallbackOptions)
          )
        )
      ),
      source: "local",
      isFallback: true,
      errorStatus: err.response?.status ?? 503,
    };
  }
}

export async function fetchCategories() {
  try {
    const { categories } = await import("../data/products");
    return { data: categories ?? [] };
  } catch {
    return { data: [] };
  }
}

export async function fetchRegions() {
  try {
    const { regions } = await import("../data/products");
    return { data: regions ?? [] };
  } catch {
    return { data: [] };
  }
}