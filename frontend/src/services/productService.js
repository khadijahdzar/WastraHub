import api from "../api/axios";
import { products, getProductById, filterProducts, getFeaturedProducts } from "../data/products";

function normalizeProduct(product) {
  const rawImage = product.image_url || product.image || "";
  const image =
    rawImage &&
    !rawImage.startsWith("http://") &&
    !rawImage.startsWith("https://") &&
    !rawImage.startsWith("/") &&
    !rawImage.startsWith("data:")
      ? `/images/products/${rawImage}`
      : rawImage;
  return {
    ...product,
    category: product.category?.name || product.category_name || product.category || "",
    region: product.region?.name || product.region_name || product.region || "",
    image,
    images: product.images?.length ? product.images : image ? [image] : [],
    isNew: Boolean(product.is_new ?? product.isNew),
    isFeatured: Boolean(product.is_featured ?? product.isFeatured),
  };
}

function normalizeList(response) {
  const data = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(data) ? data.map(normalizeProduct) : [];
}

function readLocalAdminProducts() {
  try {
    const stored = JSON.parse(localStorage.getItem("wastrahub_admin_products") || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function mergeProducts(primary, extra) {
  const byId = new Map(primary.map((product) => [String(product.id), product]));
  extra.forEach((product) => {
    if (!byId.has(String(product.id))) byId.set(String(product.id), product);
  });
  return Array.from(byId.values());
}

export async function fetchProducts(params = {}) {
  try {
    const response = await api.get("/products", { params: { per_page: 200 } });
    const apiProducts = normalizeList(response);
    const localProducts = readLocalAdminProducts().map(normalizeProduct);
    return { data: mergeProducts(apiProducts, localProducts), source: "api" };
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) throw err;
    return {
      data: mergeProducts(
        filterProducts(params).map(normalizeProduct),
        readLocalAdminProducts().map(normalizeProduct)
      ),
      source: "local",
    };
  }
}

export async function fetchProduct(id) {
  try {
    const response = await api.get(`/products/${id}`);
    return { data: normalizeProduct(response.data?.data ?? response.data), source: "api" };
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) throw err;
    const localAdminProduct = readLocalAdminProducts().find(
      (item) => String(item.id) === String(id)
    );
    const product = localAdminProduct
      ? normalizeProduct(localAdminProduct)
      : getProductById(id);
    if (!product) throw new Error("Product not found");
    return { data: product, source: "local" };
  }
}

export async function fetchFeatured() {
  // return api.get("/products/featured");
  return { data: getFeaturedProducts() };
}

export async function fetchCategories() {
  // return api.get("/categories");
  const { categories } = await import("../data/products");
  return { data: categories };
}

export async function fetchRegions() {
  // return api.get("/regions");
  const { regions } = await import("../data/products");
  return { data: regions };
}
