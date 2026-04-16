import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, orders, InsertOrder, Order } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      (values as any)[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Order operations
export async function createOrder(order: InsertOrder): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order);
  return Number(result[0].insertId);
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getUserPaidOrder(userId: number, productKey: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.productKey, productKey), eq(orders.status, "paid")))
    .orderBy(desc(orders.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateOrderStatus(orderId: number, status: "pending" | "paid" | "failed" | "refunded", paymentId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (paymentId) updateData.paymentId = paymentId;
  if (status === "paid") updateData.paidAt = new Date();
  await db.update(orders).set(updateData).where(eq(orders.id, orderId));
}

export async function getOrderByOrderNo(orderNo: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNo, orderNo)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateOrderResult(orderId: number, resultData: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ resultData }).where(eq(orders.id, orderId));
}

// Kuaishou tracking operations
export async function createKuaishouTracking(tracking: {
  callback: string;
  adid?: string;
  params?: Record<string, any>;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { kuaishouTracking } = await import("../drizzle/schema");
  const result = await db.insert(kuaishouTracking).values({
    callback: tracking.callback,
    adid: tracking.adid,
    params: tracking.params ? JSON.stringify(tracking.params) : null,
    status: "pending",
  });
  return Number(result[0].insertId);
}

export async function getKuaishouTrackingByCallback(callback: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const { kuaishouTracking } = await import("../drizzle/schema");
  const result = await db.select().from(kuaishouTracking).where(eq(kuaishouTracking.callback, callback)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateKuaishouTrackingStatus(trackingId: number, status: "pending" | "converted" | "failed", orderId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { kuaishouTracking } = await import("../drizzle/schema");
  const updateData: Record<string, unknown> = { status };
  if (orderId) updateData.orderId = orderId;
  await db.update(kuaishouTracking).set(updateData).where(eq(kuaishouTracking.id, trackingId));
}
