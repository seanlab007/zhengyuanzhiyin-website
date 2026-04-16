import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

// Mock db module
vi.mock("./db", () => ({
  getUserByPhone: vi.fn(),
  upsertUser: vi.fn(),
  createOrder: vi.fn(),
  getOrderById: vi.fn(),
  getOrderByOrderNo: vi.fn(),
  updateOrderStatus: vi.fn(),
  updateOrderResult: vi.fn(),
  getOrdersByUserId: vi.fn(),
  getUserPaidOrder: vi.fn(),
}));

// Mock SDK
vi.mock("./_core/sdk", () => ({
  sdk: {
    createSessionToken: vi.fn().mockResolvedValue("mock-token"),
  },
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "测算结果..." } }],
  }),
}));

// Mock nanoid
vi.mock("nanoid", () => ({
  nanoid: () => "test123",
}));

const caller = appRouter.createCaller({
  user: null,
  req: { headers: {} } as any,
  res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
});

const authCaller = appRouter.createCaller({
  user: { id: 1, openId: "test", role: "user", name: "Test" } as any,
  req: { headers: {} } as any,
  res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
});

describe("v2 Features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Anonymous order creation", () => {
    it("should create an anonymous order without login", async () => {
      vi.mocked(db.createOrder).mockResolvedValue(42);

      const result = await caller.orders.createAnonymous({
        productKey: "marriage",
        customerName: "张三",
        customerGender: "男",
        calendarType: "solar",
        birthDate: "1990-05-15",
        birthHour: "子时",
        paymentMethod: "wechat",
      });

      expect(result.orderId).toBe(42);
      expect(result.isFree).toBe(false);
      expect(result.orderNo).toBeTruthy();
      expect(result.amount).toBeTruthy();

      // Verify createOrder was called with correct params
      expect(db.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 0,
          productKey: "marriage",
          customerName: "张三",
          customerGender: "男",
          calendarType: "solar",
          birthDate: "1990-05-15",
          birthHour: "子时",
          status: "pending",
        })
      );
    });

    it("should reject invalid product key", async () => {
      await expect(
        caller.orders.createAnonymous({
          productKey: "nonexistent",
          customerName: "张三",
          customerGender: "男",
          calendarType: "solar",
          birthDate: "1990-05-15",
          birthHour: "子时",
          paymentMethod: "wechat",
        })
      ).rejects.toThrow();
    });

    it("should support lunar calendar type", async () => {
      vi.mocked(db.createOrder).mockResolvedValue(43);

      const result = await caller.orders.createAnonymous({
        productKey: "marriage",
        customerName: "李四",
        customerGender: "女",
        calendarType: "lunar",
        birthDate: "1990-3-15",
        birthHour: "午时",
        lunarDateStr: "农历 1990年三月十五 午时",
        paymentMethod: "wechat",
      });

      expect(result.orderId).toBe(43);
      expect(db.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          calendarType: "lunar",
          lunarDateStr: "农历 1990年三月十五 午时",
        })
      );
    });
  });

  describe("Order lookup by orderNo", () => {
    it("should find order by orderNo", async () => {
      const mockOrder = {
        id: 42,
        orderNo: "20260416120000001",
        productKey: "marriage",
        productName: "姻缘测算",
        amount: "4.90",
        status: "paid",
        customerName: "张三",
        customerGender: "男",
        lunarDateStr: "公历 1990年5月15日 子时",
        createdAt: new Date(),
      };
      vi.mocked(db.getOrderByOrderNo).mockResolvedValue(mockOrder as any);

      const result = await caller.orders.lookupByOrderNo({ orderNo: "20260416120000001" });
      expect(result.id).toBe(42);
      expect(result.customerName).toBe("张三");
    });

    it("should throw NOT_FOUND for invalid orderNo", async () => {
      vi.mocked(db.getOrderByOrderNo).mockResolvedValue(undefined);

      await expect(
        caller.orders.lookupByOrderNo({ orderNo: "invalid" })
      ).rejects.toThrow();
    });
  });

  describe("Simulate payment", () => {
    it("should mark order as paid", async () => {
      vi.mocked(db.getOrderById).mockResolvedValue({
        id: 42,
        status: "pending",
      } as any);
      vi.mocked(db.updateOrderStatus).mockResolvedValue(undefined);

      const result = await caller.orders.simulatePay({ orderId: 42 });
      expect(result.success).toBe(true);
      expect(db.updateOrderStatus).toHaveBeenCalledWith(42, "paid", expect.any(String));
    });

    it("should reject already paid orders", async () => {
      vi.mocked(db.getOrderById).mockResolvedValue({
        id: 42,
        status: "paid",
      } as any);

      await expect(
        caller.orders.simulatePay({ orderId: 42 })
      ).rejects.toThrow();
    });
  });

  describe("Fortune generation", () => {
    it("should generate fortune for paid order", async () => {
      vi.mocked(db.getOrderById).mockResolvedValue({
        id: 42,
        status: "paid",
        productKey: "marriage",
        inputData: JSON.stringify({ name: "张三", gender: "男" }),
        resultData: null,
      } as any);
      vi.mocked(db.updateOrderResult).mockResolvedValue(undefined);

      const result = await caller.fortune.generate({
        orderId: 42,
        productKey: "marriage",
      });

      expect(result.result).toBeTruthy();
    });

    it("should reject unpaid orders", async () => {
      vi.mocked(db.getOrderById).mockResolvedValue({
        id: 42,
        status: "pending",
      } as any);

      await expect(
        caller.fortune.generate({ orderId: 42, productKey: "marriage" })
      ).rejects.toThrow("请先完成支付");
    });

    it("should return existing result without regenerating", async () => {
      vi.mocked(db.getOrderById).mockResolvedValue({
        id: 42,
        status: "paid",
        resultData: "已有结果",
      } as any);

      const result = await caller.fortune.generate({
        orderId: 42,
        productKey: "marriage",
      });

      expect(result.result).toBe("已有结果");
    });
  });

  describe("Products list", () => {
    it("should return products list", async () => {
      const products = await caller.products.list();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
      expect(products[0]).toHaveProperty("key");
      expect(products[0]).toHaveProperty("name");
      expect(products[0]).toHaveProperty("price");
    });
  });
});
