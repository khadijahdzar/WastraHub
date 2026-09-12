import { describe, expect, it } from "vitest";
import { calculateVoucherDiscount, readVouchers } from "./vouchers";

describe("readVouchers", () => {
  it("reads a valid voucher list", () => {
    const storage = { getItem: () => '[{"code":"SAVE10"}]' };
    expect(readVouchers(storage)).toEqual([{ code: "SAVE10" }]);
  });

  it("returns an empty list for malformed, null, or non-array storage", () => {
    expect(readVouchers({ getItem: () => "not-json" })).toEqual([]);
    expect(readVouchers({ getItem: () => "null" })).toEqual([]);
    expect(readVouchers({ getItem: () => "{}" })).toEqual([]);
    expect(readVouchers(null)).toEqual([]);
  });
});

describe("calculateVoucherDiscount", () => {
  const vouchers = [
    { code: "SAVE10", type: "percent", value: 10, active: true },
    { code: "FIXED", type: "fixed", value: 15000, active: true },
    { code: "OFF", type: "percent", value: 10, active: false },
  ];

  it("calculates percentage and fixed discounts", () => {
    expect(calculateVoucherDiscount(vouchers, " save10 ", 100000).discount).toBe(10000);
    expect(calculateVoucherDiscount(vouchers, "FIXED", 100000).discount).toBe(15000);
  });

  it("caps discounts at subtotal and percentage at 100", () => {
    expect(calculateVoucherDiscount([{ code: "ALL", type: "percent", value: 250 }], "all", 500).discount).toBe(500);
    expect(calculateVoucherDiscount([{ code: "BIG", type: "fixed", value: 9999 }], "big", 100).discount).toBe(100);
  });

  it("returns zero for invalid code, inactive voucher, zero subtotal, and invalid values", () => {
    expect(calculateVoucherDiscount(vouchers, "missing", 100)).toEqual({ code: "MISSING", discount: 0 });
    expect(calculateVoucherDiscount(vouchers, "off", 100).discount).toBe(0);
    expect(calculateVoucherDiscount(vouchers, "fixed", 0).discount).toBe(0);
    expect(calculateVoucherDiscount([{ code: "BAD", type: "fixed", value: "wat" }], "bad", 100).discount).toBe(0);
    expect(calculateVoucherDiscount(null, null, undefined).discount).toBe(0);
  });
});
