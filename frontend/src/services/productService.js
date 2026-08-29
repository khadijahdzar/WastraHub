import api from "../api/axios";
import { products, getProductById, filterProducts, getFeaturedProducts } from "../data/products";

// Dummy implementation - ready for Laravel API

export async function fetchProducts(params = {}) {
  // return api.get("/products", { params });
  return { data: filterProducts(params) };
}

export async function fetchProduct(id) {
  // return api.get(`/products/${id}`);
  const product = getProductById(id);
  if (!product) throw new Error("Product not found");
  return { data: product };
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
