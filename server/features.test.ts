import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { PRODUCTS, getProductByKey } from "../shared/products";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

type CookieSetCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

function createPublicContext() {
  const setCookies: CookieSetCall[] = [];
  const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, setCookies, clearedCookies };
}

function createUserContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: role === "admin" ? "phone_13800138000" : "phone_13900139000",
    email: null,
    name: role === "admin" ? "管理员" : "测试用户",
    loginMethod: "phone",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Products", () => {
  it("has exactly 6 visible products", () => {
    expect(PRODUCTS).toHaveLength(6);
  });

  it("has correct pricing for visible products", () => {
    const expected: Record<string, number> = {
      marriage: 9.9,
      daily: 0,
      ziwei: 29.9,
      wealth: 19.9,
      name: 9.9,
      dayun: 39.9,
    };
    for (const [key, price] of Object.entries(expected)) {
      const product = getProductByKey(key);
      expect(product).toBeDefined();
      expect(product!.price).toBe(price);
    }
  });

  it("hidden products are still accessible via getProductByKey", () => {
    const bazi = getProductByKey("bazi");
    expect(bazi).toBeDefined();
    expect(bazi!.price).toBe(19.9);
    const tarot = getProductByKey("tarot");
    expect(tarot).toBeDefined();
    expect(tarot!.price).toBe(9.9);
  });

  it("marks daily fortune as free", () => {
    const daily = getProductByKey("daily");
    expect(daily).toBeDefined();
    expect(daily!.isFree).toBe(true);
  });

  it("marks all paid products as not free", () => {
    const paidProducts = PRODUCTS.filter(p => p.key !== "daily");
    for (const p of paidProducts) {
      expect(p.isFree).toBe(false);
    }
  });

  it("returns undefined for unknown product key", () => {
    expect(getProductByKey("nonexistent")).toBeUndefined();
  });
});

describe("Products list API", () => {
  it("returns visible products via public procedure", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const products = await caller.products.list();
    expect(products).toHaveLength(6);
    expect(products[0].key).toBe("marriage");
    expect(products[0].price).toBe(9.9);
  });
});

describe("Auth - me endpoint", () => {
  it("returns null for unauthenticated user", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const me = await caller.auth.me();
    expect(me).toBeNull();
  });

  it("returns user info for authenticated user", async () => {
    const ctx = createUserContext("user");
    const caller = appRouter.createCaller(ctx);
    const me = await caller.auth.me();
    expect(me).toBeDefined();
    expect(me!.role).toBe("user");
    expect(me!.name).toBe("测试用户");
  });

  it("returns admin info for admin user", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);
    const me = await caller.auth.me();
    expect(me).toBeDefined();
    expect(me!.role).toBe("admin");
    expect(me!.name).toBe("管理员");
  });
});

describe("Orders - access check", () => {
  it("admin has access to all products", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    for (const product of PRODUCTS) {
      const result = await caller.orders.checkAccess({ productKey: product.key });
      expect(result.hasAccess).toBe(true);
    }
  });

  it("free products are accessible to regular users", async () => {
    const ctx = createUserContext("user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.checkAccess({ productKey: "daily" });
    expect(result.hasAccess).toBe(true);
  });
});
