import { pgTable, serial, text, numeric, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const couponsTable = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  minOrder: numeric("min_order", { precision: 10, scale: 2 }).default("0"),
  isActive: boolean("is_active").notNull().default(true),
  usedCount: integer("used_count").notNull().default(0),
  maxUses: integer("max_uses"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Coupon = typeof couponsTable.$inferSelect;
export type InsertCoupon = typeof couponsTable.$inferInsert;
