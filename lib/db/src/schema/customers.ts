import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  phone: text("phone").unique(),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customerOtpsTable = pgTable("customer_otps", {
  id: serial("id").primaryKey(),
  phone: text("phone"),
  email: text("email"),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Customer = typeof customersTable.$inferSelect;
export type InsertCustomer = typeof customersTable.$inferInsert;
export type CustomerOtp = typeof customerOtpsTable.$inferSelect;

// Contact inquiries submitted via the store chat widget
export const contactInquiriesTable = pgTable("contact_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // new | read | replied
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ContactInquiry = typeof contactInquiriesTable.$inferSelect;
export type InsertContactInquiry = typeof contactInquiriesTable.$inferInsert;
