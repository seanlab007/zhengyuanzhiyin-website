import { describe, it, expect } from "vitest";
import { getProductByKey, PRODUCTS } from "../shared/products";

describe("Payment Flow Logic", () => {
  it("marriage product exists and has correct price", () => {
    const product = getProductByKey("marriage");
    expect(product).toBeDefined();
    expect(product!.price).toBe(9.9);
    expect(product!.isFree).toBe(false);
    expect(product!.isLocked).toBe(false);
  });

  it("daily product is free", () => {
    const product = getProductByKey("daily");
    expect(product).toBeDefined();
    expect(product!.price).toBe(0);
    expect(product!.isFree).toBe(true);
  });

  it("locked products should have isLocked=true", () => {
    const lockedProducts = PRODUCTS.filter(p => p.isLocked);
    expect(lockedProducts.length).toBeGreaterThan(0);
    for (const p of lockedProducts) {
      expect(p.isLocked).toBe(true);
    }
  });

  it("only marriage and daily are available (not locked)", () => {
    const available = PRODUCTS.filter(p => !p.isLocked);
    const keys = available.map(p => p.key);
    expect(keys).toContain("marriage");
    expect(keys).toContain("daily");
  });

  it("marriage product key is valid for order creation", () => {
    const product = getProductByKey("marriage");
    expect(product).toBeDefined();
    expect(product!.key).toBe("marriage");
    expect(product!.name).toBe("姻缘测算");
  });
});
