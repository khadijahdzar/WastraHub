import { describe, expect, it } from "vitest";
import { normalizeOrder } from "./orderService";

describe("normalizeOrder", () => {
  it("normalizes an order and calculates a 3-7 day estimate", () => {
    const result = normalizeOrder({
      id: 4,
      created_at: "2026-09-12T00:00:00.000Z",
      status: "paid",
      details: [{ quantity: 2, price: 25000, product: { name: "Batik", image: "batik.jpg" } }],
    });
    expect(result.status).toBe("belum-dikirim");
    expect(result.items[0]).toMatchObject({ name: "Batik", qty: 2, price: 25000 });
    expect(result.items[0].image).toBe("/images/products/batik.jpg");
    expect(new Date(result.estimatedEnd).getTime() - new Date(result.estimatedStart).getTime()).toBe(4 * 86400000);
  });

  it("does not throw for missing or invalid order data", () => {
    expect(normalizeOrder(null)).toBeNull();
    const result = normalizeOrder({ id: 5, created_at: "invalid", details: null });
    expect(result.items).toEqual([]);
    expect(Number.isNaN(new Date(result.estimatedStart).getTime())).toBe(false);
  });

  it("falls back when backend estimate dates are invalid", () => {
    const result = normalizeOrder({
      id: 6,
      created_at: "2026-09-12T00:00:00.000Z",
      estimated_start: "invalid",
      estimated_end: null,
    });
    expect(Number.isNaN(new Date(result.estimatedStart).getTime())).toBe(false);
    expect(Number.isNaN(new Date(result.estimatedEnd).getTime())).toBe(false);
  });
});
