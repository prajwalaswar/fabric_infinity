import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const bannersTable = pgTable("banners", {
  id: serial("id").primaryKey(),
  image: text("image").notNull(),
  title: text("title"),
  subtitle: text("subtitle"),
  ctaText: text("cta_text"),
  ctaLink: text("cta_link"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Banner = typeof bannersTable.$inferSelect;
export type InsertBanner = typeof bannersTable.$inferInsert;
