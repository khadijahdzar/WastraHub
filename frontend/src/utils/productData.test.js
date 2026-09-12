import { describe, expect, it } from "vitest";
import { filterFeatured, mergeProducts, normalizeProduct } from "./productData";

describe("normalizeProduct", () => {
  it("normalizes relative images and nested metadata", () => {
    const result = normalizeProduct({
      image: "cloth.jpg",
      category: { name: "Batik Modern" },
      region: { name: "Pekalongan" },
      is_featured: 1,
    });
    expect(result.image).toBe("/images/products/cloth.jpg");
    expect(result.images).toEqual(["/images/products/cloth.jpg"]);
    expect(result.category).toBe("Batik Modern");
    expect(result.isFeatured).toBe(true);
  });

  it("preserves absolute, root-relative, and data images", () => {
    expect(normalizeProduct({ image: "https://example.test/a.jpg" }).image).toBe("https://example.test/a.jpg");
    expect(normalizeProduct({ image: "/a.jpg" }).image).toBe("/a.jpg");
    expect(normalizeProduct({ image: "data:image/png;base64,x" }).image).toBe("data:image/png;base64,x");
  });

  it("handles nullish product input", () => {
    expect(normalizeProduct(null).images).toEqual([]);
    expect(normalizeProduct(undefined).category).toBe("");
  });
});

describe("mergeProducts and filterFeatured", () => {
  it("overrides matching IDs while retaining other API fields", () => {
    expect(mergeProducts([{ id: 1, name: "old", region: "Java" }], [{ id: 1, name: "new" }])).toEqual([
      { id: 1, name: "new", region: "Java" },
    ]);
  });

  it("does not treat every active product as featured", () => {
    expect(filterFeatured([
      { id: 1, status: "active", isFeatured: true },
      { id: 2, status: "active", isFeatured: false },
      { id: 3, status: "inactive", isFeatured: true },
    ]).map((product) => product.id)).toEqual([1]);
    expect(mergeProducts(null, undefined)).toEqual([]);
  });
});
