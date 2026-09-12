export function readVouchers(storage = globalThis.localStorage) {
  try {
    const value = JSON.parse(storage?.getItem("wastrahub_vouchers") || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function calculateVoucherDiscount(vouchers, code, subtotal) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  const voucher = (Array.isArray(vouchers) ? vouchers : []).find(
    (item) => String(item?.code || "").toUpperCase() === normalizedCode && item?.active !== false
  );
  if (!voucher || safeSubtotal === 0) return { code: normalizedCode, discount: 0 };

  const rawValue = Number(voucher.value);
  if (!Number.isFinite(rawValue) || rawValue < 0) {
    return { code: normalizedCode, discount: 0 };
  }
  const discount = voucher.type === "percent"
    ? safeSubtotal * Math.min(rawValue, 100) / 100
    : rawValue;
  return { code: normalizedCode, discount: Math.min(safeSubtotal, discount) };
}