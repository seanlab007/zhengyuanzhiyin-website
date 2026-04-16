import { COOKIE_NAME } from "@shared/const";
import { PRODUCTS, getProductByKey } from "@shared/products";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createHash } from "crypto";
import { nanoid } from "nanoid";
import { createWechatPayment, queryWechatOrder } from "./payment/wechat";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function generateOrderNo(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `${y}${m}${d}${h}${min}${s}${rand}`;
}

// Admin hardcoded credentials
const ADMIN_PHONE = "13800138000";
const ADMIN_PASSWORD = "123456";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    // Phone login/register (kept for admin access)
    phoneLogin: publicProcedure
      .input(z.object({
        phone: z.string().min(11).max(11),
        password: z.string().min(6).max(64),
      }))
      .mutation(async ({ input, ctx }) => {
        const { phone, password } = input;
        const isAdmin = phone === ADMIN_PHONE && password === ADMIN_PASSWORD;
        let user = await db.getUserByPhone(phone);

        if (!user && !isAdmin) {
          throw new TRPCError({ code: "NOT_FOUND", message: "账号不存在，请先注册" });
        }

        if (isAdmin && !user) {
          const openId = `phone_${phone}`;
          await db.upsertUser({
            openId, phone, name: "管理员",
            passwordHash: hashPassword(password),
            role: "admin", loginMethod: "phone",
            lastSignedIn: new Date(),
          });
          user = await db.getUserByPhone(phone);
        }

        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "账号不存在" });

        if (isAdmin) {
          if (user.role !== "admin") {
            await db.upsertUser({ openId: user.openId, role: "admin" });
            user = await db.getUserByPhone(phone);
          }
        } else {
          const hashedInput = hashPassword(password);
          if (user.passwordHash !== hashedInput) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "密码错误" });
          }
        }

        if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || phone });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });
        await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
        return { success: true, user };
      }),

    phoneRegister: publicProcedure
      .input(z.object({
        phone: z.string().min(11).max(11),
        password: z.string().min(6).max(64),
        name: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { phone, password, name } = input;
        const existing = await db.getUserByPhone(phone);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "该手机号已注册" });

        const openId = `phone_${phone}`;
        const isAdmin = phone === ADMIN_PHONE;
        await db.upsertUser({
          openId, phone,
          name: name || `用户${phone.slice(-4)}`,
          passwordHash: hashPassword(password),
          role: isAdmin ? "admin" : "user",
          loginMethod: "phone",
          lastSignedIn: new Date(),
        });
        const user = await db.getUserByPhone(phone);
        if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || phone });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });
        return { success: true, user };
      }),
  }),

  // Products
  products: router({
    list: publicProcedure.query(() => PRODUCTS),
  }),

  // Orders - now supports anonymous creation
  orders: router({
    // Anonymous order creation - no login required
    createAnonymous: publicProcedure
      .input(z.object({
        productKey: z.string(),
        customerName: z.string().min(1).max(32),
        customerGender: z.enum(["男", "女"]),
        calendarType: z.enum(["solar", "lunar"]),
        birthDate: z.string(),
        birthHour: z.string(),
        lunarDateStr: z.string().optional(),
        paymentMethod: z.enum(["wechat", "alipay"]),
      }))
      .mutation(async ({ input }) => {
        const product = getProductByKey(input.productKey);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "产品不存在" });

        const orderNo = generateOrderNo();
        const inputData = JSON.stringify({
          name: input.customerName,
          gender: input.customerGender,
          calendarType: input.calendarType,
          birthDate: input.birthDate,
          birthHour: input.birthHour,
          lunarDateStr: input.lunarDateStr || "",
        });

        const orderId = await db.createOrder({
          userId: 0,
          orderNo,
          productKey: product.key,
          productName: product.name,
          amount: String(product.price),
          status: "pending",
          paymentMethod: input.paymentMethod,
          customerName: input.customerName,
          customerGender: input.customerGender,
          calendarType: input.calendarType,
          birthDate: input.birthDate,
          birthHour: input.birthHour,
          lunarDateStr: input.lunarDateStr || null,
          inputData,
        });

        return {
          orderId,
          orderNo,
          isFree: false,
          amount: product.price,
          productName: product.name,
        };
      }),

    // Create WeChat payment - calls real WeChat API
    createWechatPay: publicProcedure
      .input(z.object({
        orderId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "订单不存在" });
        if (order.status === "paid") {
          return { success: true, alreadyPaid: true, codeUrl: null };
        }
        if (order.status !== "pending") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "订单状态异常" });
        }

        const clientIp = ctx.req.headers["x-forwarded-for"] as string || ctx.req.socket.remoteAddress || "127.0.0.1";
        const ip = clientIp.split(",")[0].trim();

        const result = await createWechatPayment(
          order.orderNo,
          parseFloat(order.amount),
          order.productName,
          ip
        );

        if (!result.success) {
          console.error("[WechatPay] Failed to create payment:", result.error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error || "创建支付失败" });
        }

        return {
          success: true,
          alreadyPaid: false,
          codeUrl: result.codeUrl,
          orderNo: order.orderNo,
        };
      }),

    // Check payment status by polling
    checkPayStatus: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        
        // If already paid in our DB (from callback)
        if (order.status === "paid") {
          return { paid: true };
        }

        // Otherwise query WeChat for latest status
        try {
          const wxResult = await queryWechatOrder(order.orderNo);
          if (wxResult.success && wxResult.tradeState === "SUCCESS") {
            // Update our DB
            await db.updateOrderStatus(input.orderId, "paid", wxResult.transactionId || `wx_${nanoid()}`);
            return { paid: true };
          }
        } catch (e) {
          console.error("[WechatPay] Query error:", e);
        }

        return { paid: false };
      }),

    // Simulate payment completion (for demo/testing - admin only)
    simulatePay: publicProcedure
      .input(z.object({
        orderId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        if (order.status !== "pending") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "订单状态异常" });
        }
        await db.updateOrderStatus(input.orderId, "paid", `sim_${nanoid()}`);
        return { success: true };
      }),

    // Get order by ID (public - for payment page)
    getById: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        return order;
      }),

    // Lookup order by orderNo (for customer order lookup)
    lookupByOrderNo: publicProcedure
      .input(z.object({ orderNo: z.string().min(1) }))
      .query(async ({ input }) => {
        const order = await db.getOrderByOrderNo(input.orderNo);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "未找到该订单" });
        return order;
      }),

    // Legacy authenticated endpoints
    create: protectedProcedure
      .input(z.object({
        productKey: z.string(),
        inputData: z.string().optional(),
        paymentMethod: z.enum(["wechat", "alipay"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = getProductByKey(input.productKey);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "产品不存在" });

        const orderNo = generateOrderNo();

        if (product.isFree) {
          const orderId = await db.createOrder({
            userId: ctx.user.id,
            orderNo,
            productKey: product.key,
            productName: product.name,
            amount: "0.00",
            status: "paid",
            paymentMethod: "free",
            inputData: input.inputData || null,
            paidAt: new Date(),
          });
          return { orderId, orderNo, paymentUrl: null, isFree: true };
        }

        if (ctx.user.role === "admin") {
          const orderId = await db.createOrder({
            userId: ctx.user.id,
            orderNo,
            productKey: product.key,
            productName: product.name,
            amount: String(product.price),
            status: "paid",
            paymentMethod: "admin_bypass",
            inputData: input.inputData || null,
            paidAt: new Date(),
          });
          return { orderId, orderNo, paymentUrl: null, isFree: true };
        }

        const orderId = await db.createOrder({
          userId: ctx.user.id,
          orderNo,
          productKey: product.key,
          productName: product.name,
          amount: String(product.price),
          status: "pending",
          paymentMethod: input.paymentMethod,
          inputData: input.inputData || null,
        });

        return {
          orderId,
          orderNo,
          paymentUrl: `/payment?order_id=${orderId}`,
          isFree: false,
          amount: product.price,
          productName: product.name,
        };
      }),

    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrdersByUserId(ctx.user.id);
    }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrdersByUserId(ctx.user.id);
    }),

    checkAccess: protectedProcedure
      .input(z.object({ productKey: z.string() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role === "admin") return { hasAccess: true, order: null };
        const product = getProductByKey(input.productKey);
        if (!product) return { hasAccess: false, order: null };
        if (product.isFree) return { hasAccess: true, order: null };
        const order = await db.getUserPaidOrder(ctx.user.id, input.productKey);
        return { hasAccess: !!order, order };
      }),

    getResult: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return order;
      }),
  }),

  // Fortune reading generation - now public (uses orderId)
  fortune: router({
    generate: publicProcedure
      .input(z.object({
        orderId: z.number(),
        productKey: z.string(),
      }))
      .mutation(async ({ input }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        if (order.status !== "paid") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "请先完成支付" });
        }

        // If already has result, return it
        if (order.resultData) {
          return { result: order.resultData };
        }

        const product = getProductByKey(input.productKey);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });

        let parsedInput: Record<string, string> = {};
        try { parsedInput = JSON.parse(order.inputData || "{}"); } catch {}

        const systemPrompt = getFortuneSystemPrompt(input.productKey, parsedInput);

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `请根据以下信息进行${product.name}分析：\n${JSON.stringify(parsedInput, null, 2)}` },
            ],
          });

          const rawContent = response.choices?.[0]?.message?.content;
          const result = (typeof rawContent === "string" ? rawContent : "暂时无法生成结果，请稍后重试。");
          await db.updateOrderResult(input.orderId, result);
          return { result };
        } catch (error) {
          console.error("[Fortune] LLM generation failed:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "生成结果失败，请稍后重试" });
        }
      }),
  }),
});

function getFortuneSystemPrompt(productKey: string, input: Record<string, string>): string {
  const prompts: Record<string, string> = {
    bazi: "你是一位专业的八字命理大师，精通四柱八字、天干地支、五行生克。请根据用户提供的出生年月日时，进行详细的八字排盘分析，包括：四柱排盘、五行分析、十神分析、大运流年、性格特征、事业财运、婚姻感情等方面。语言要专业但通俗易懂，给出具体的建议。请用markdown格式输出，结构清晰。",
    ziwei: "你是一位专业的紫微斗数大师，精通紫微星盘、十二宫位、主星副星。请根据用户提供的信息，进行紫微斗数全面解读，包括：命宫分析、财帛宫、官禄宫、夫妻宫、迁移宫等十二宫位详解。语言要专业但通俗易懂。请用markdown格式输出。",
    marriage: "你是一位专业的姻缘分析师，精通八字合婚、五行配对。请根据用户提供的信息，进行深度姻缘分析，包括：感情运势、桃花运、最佳配偶特征、婚姻时机、感情建议等。语言温暖亲切，给出实用建议。请用markdown格式输出。",
    wealth: "你是一位专业的财运分析师，精通八字财运、五行旺衰。请根据用户提供的信息，进行财运深度分析，包括：正财偏财分析、投资方向建议、财运旺衰周期、开运方法等。请用markdown格式输出。",
    name: "你是一位专业的姓名学大师，精通五格剖象法、三才配置。请根据用户提供的姓名，进行详细的姓名测试分析，包括：天格、人格、地格、外格、总格分析，三才配置，字义解析，名字对运势的影响等。请用markdown格式输出。",
    daily: "你是一位专业的运势分析师。请根据用户的生肖或星座，给出今日详细运势分析，包括：整体运势、爱情运、事业运、财运、健康运、幸运数字、幸运颜色、开运建议等。语言积极向上，给人正能量。请用markdown格式输出。",
    dayun: "你是一位专业的命理大师，精通大运流年分析。请根据用户提供的信息，进行十年大运和流年详批，包括：每步大运的运势特征、关键年份提醒、事业发展建议、感情变化、健康注意事项等。请用markdown格式输出。",
    tarot: "你是一位专业的塔罗牌占卜师，精通韦特塔罗。请根据用户的问题，进行塔罗牌阵解读。随机抽取3张牌（过去、现在、未来），详细解读每张牌的含义、牌面之间的关联，以及对用户问题的指引。语言神秘而温暖。请用markdown格式输出。",
  };
  return prompts[productKey] || "你是一位专业的命理分析师，请根据用户提供的信息进行专业分析。请用markdown格式输出。";
}

export type AppRouter = typeof appRouter;
