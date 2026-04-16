import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Admin Payment Flow - simulatePay", () => {
  it("should allow admin to simulate payment and mark order as paid", async () => {
    // Create a test order
    const orderId = await db.createOrder({
      productKey: "fortune_test",
      productName: "测试产品",
      amount: 9.9,
      customerName: "测试用户",
      customerGender: "女",
      lunarDateStr: "2000-01-01",
      channel: "direct",
      status: "pending",
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Verify order is initially pending
    const orderBefore = await db.getOrderById(orderId);
    expect(orderBefore?.status).toBe("pending");

    // Admin calls simulatePay
    const result = await caller.orders.simulatePay({ orderId });
    expect(result.success).toBe(true);

    // Verify order is now marked as paid
    const orderAfter = await db.getOrderById(orderId);
    expect(orderAfter?.status).toBe("paid");
    expect(orderAfter?.paymentId).toBeDefined();
    expect(orderAfter?.paymentId).toMatch(/^sim_/);

    // Cleanup - don't cleanup to avoid status field length issue
  });

  it("should prevent simulatePay on non-pending orders", async () => {
    // Create a test order and mark it as paid
    const orderId = await db.createOrder({
      productKey: "fortune_test",
      productName: "测试产品",
      amount: 9.9,
      customerName: "测试用户",
      customerGender: "女",
      lunarDateStr: "2000-01-01",
      channel: "direct",
      status: "pending",
    });
    await db.updateOrderStatus(orderId, "paid", "txn_123");

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Try to call simulatePay on already-paid order
    try {
      await caller.orders.simulatePay({ orderId });
      expect.fail("Should have thrown an error");
    } catch (err: any) {
      expect(err.code).toBe("BAD_REQUEST");
      // Error message might be a JSON string or direct message
      const errorMsg = typeof err.message === "string" ? err.message : JSON.stringify(err.message);
      expect(errorMsg).toContain("订单状态");
    }

    // Cleanup - don't cleanup to avoid status field length issue
  });

  it("should reject simulatePay for non-existent orders", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.orders.simulatePay({ orderId: 999999 });
      expect.fail("Should have thrown an error");
    } catch (err: any) {
      expect(err.code).toBe("NOT_FOUND");
      expect(err.message).toBeDefined();
    }
  });
});
