import { pgTable, serial, text, integer, boolean, numeric, timestamp } from "drizzle-orm/pg-core";
import { categoriesTable } from "./categories";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  fabricDetails: text("fabric_details"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  offerPrice: numeric("offer_price", { precision: 10, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  images: text("images").array().notNull().default([]),
  variants: text("variants"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isBestseller: boolean("is_bestseller").notNull().default(false),
  isNewArrival: boolean("is_new_arrival").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Product = typeof productsTable.$inferSelect;
export type InsertProduct = typeof productsTable.$inferInsert;
