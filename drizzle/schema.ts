import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with phone/password login support.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).unique(),
  passwordHash: varchar("passwordHash", { length: 256 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Orders table for tracking purchases.
 * userId=0 means anonymous order (no login required).
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().default(0),
  /** Unique order number for customer lookup */
  orderNo: varchar("orderNo", { length: 64 }).notNull(),
  productKey: varchar("productKey", { length: 64 }).notNull(),
  productName: varchar("productName", { length: 128 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 32 }),
  paymentId: varchar("paymentId", { length: 256 }),
  /** Customer name */
  customerName: varchar("customerName", { length: 64 }),
  /** Customer gender */
  customerGender: varchar("customerGender", { length: 8 }),
  /** Calendar type: solar or lunar */
  calendarType: varchar("calendarType", { length: 16 }),
  /** Birth date string (e.g. 2026-04-16) */
  birthDate: varchar("birthDate", { length: 32 }),
  /** Birth hour/shichen (e.g. 丑时) */
  birthHour: varchar("birthHour", { length: 16 }),
  /** Lunar date display string */
  lunarDateStr: varchar("lunarDateStr", { length: 64 }),
  /** JSON string storing the input params for the fortune reading */
  inputData: text("inputData"),
  /** JSON string storing the fortune reading result */
  resultData: text("resultData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  paidAt: timestamp("paidAt"),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Kuaishou tracking data for ad attribution
 */
export const kuaishouTracking = mysqlTable("kuaishou_tracking", {
  id: int("id").autoincrement().primaryKey(),
  /** Unique callback ID from Kuaishou */
  callback: varchar("callback", { length: 256 }).notNull().unique(),
  /** Ad plan ID */
  adid: varchar("adid", { length: 128 }),
  /** Channel identifier */
  channel: varchar("channel", { length: 64 }).default("kuaishou").notNull(),
  /** Additional tracking parameters as JSON */
  params: text("params"),
  /** Associated order ID (if any) */
  orderId: int("orderId"),
  /** Tracking status: pending, converted, failed */
  status: mysqlEnum("status", ["pending", "converted", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KuaishouTracking = typeof kuaishouTracking.$inferSelect;
export type InsertKuaishouTracking = typeof kuaishouTracking.$inferInsert;
