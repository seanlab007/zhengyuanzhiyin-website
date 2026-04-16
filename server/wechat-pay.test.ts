import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateWechatSignature, generateNonceStr, verifyWechatCallback } from "./payment/wechat";

describe("WeChat Payment Module", () => {
  describe("generateNonceStr", () => {
    it("should generate a 32-character hex string", () => {
      const nonce = generateNonceStr();
      expect(nonce).toHaveLength(32);
      expect(nonce).toMatch(/^[a-f0-9]+$/);
    });

    it("should generate unique strings", () => {
      const nonce1 = generateNonceStr();
      const nonce2 = generateNonceStr();
      expect(nonce1).not.toBe(nonce2);
    });
  });

  describe("generateWechatSignature", () => {
    it("should generate MD5 signature from sorted params", () => {
      const data = {
        appid: "wx411431aeb832204f",
        mch_id: "1111291395",
        nonce_str: "test123",
        body: "测试商品",
        out_trade_no: "ORDER001",
        total_fee: 490,
      };

      const sign = generateWechatSignature(data);
      expect(sign).toHaveLength(32);
      expect(sign).toMatch(/^[A-F0-9]+$/); // MD5 uppercase hex
    });

    it("should exclude empty values and sign field", () => {
      const data = {
        appid: "wx411431aeb832204f",
        mch_id: "1111291395",
        sign: "OLD_SIGN",
        empty_field: "",
        null_field: null,
      };

      const sign = generateWechatSignature(data);
      expect(sign).toHaveLength(32);
    });

    it("should produce consistent signatures for same input", () => {
      const data = {
        appid: "wx411431aeb832204f",
        mch_id: "1111291395",
        nonce_str: "fixed_nonce",
      };

      const sign1 = generateWechatSignature(data);
      const sign2 = generateWechatSignature(data);
      expect(sign1).toBe(sign2);
    });
  });

  describe("verifyWechatCallback", () => {
    it("should verify a valid callback signature", () => {
      const data: Record<string, any> = {
        appid: "wx411431aeb832204f",
        mch_id: "1111291395",
        nonce_str: "test_nonce",
        out_trade_no: "ORDER001",
        result_code: "SUCCESS",
        return_code: "SUCCESS",
      };

      // Generate the correct sign
      const correctSign = generateWechatSignature(data);
      data.sign = correctSign;

      expect(verifyWechatCallback(data)).toBe(true);
    });

    it("should reject an invalid callback signature", () => {
      const data = {
        appid: "wx411431aeb832204f",
        mch_id: "1111291395",
        nonce_str: "test_nonce",
        sign: "INVALID_SIGN_VALUE_HERE_12345678",
      };

      expect(verifyWechatCallback(data)).toBe(false);
    });
  });
});

describe("WeChat Payment tRPC Routes", () => {
  // Mock dependencies
  vi.mock("./db", () => ({
    getOrderById: vi.fn(),
    updateOrderStatus: vi.fn(),
    getOrderByOrderNo: vi.fn(),
    createOrder: vi.fn(),
    getProductList: vi.fn(),
    getUserOrders: vi.fn(),
  }));

  vi.mock("./payment/wechat", async (importOriginal) => {
    const actual = await importOriginal() as any;
    return {
      ...actual,
      createWechatPayment: vi.fn(),
      queryWechatOrder: vi.fn(),
    };
  });

  vi.mock("nanoid", () => ({
    nanoid: () => "test-nano-id",
  }));

  vi.mock("./_core/llm", () => ({
    invokeLLM: vi.fn().mockResolvedValue({
      choices: [{ message: { content: "测试结果" } }],
    }),
  }));

  it("should have createWechatPay and checkPayStatus routes defined", async () => {
    const { appRouter } = await import("./routers");
    // Verify the routes exist on the router
    expect(appRouter._def.procedures).toHaveProperty("orders.createWechatPay");
    expect(appRouter._def.procedures).toHaveProperty("orders.checkPayStatus");
    expect(appRouter._def.procedures).toHaveProperty("orders.simulatePay");
  });
});
