import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: integer("balance").notNull().default(0),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // "add" or "deduct"
  note: text("note").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const otpHistory = pgTable("otp_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  otp: text("otp").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredId: integer("referred_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  credited: boolean("credited").notNull().default(false),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  referralCode: true,
  referredBy: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  type: true,
  note: true,
});

export const insertOtpHistorySchema = createInsertSchema(otpHistory).pick({
  userId: true,
  otp: true,
});

export const insertReferralSchema = createInsertSchema(referrals).pick({
  referrerId: true,
  referredId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type OtpHistory = typeof otpHistory.$inferSelect;
export type Referral = typeof referrals.$inferSelect;

// API Types
export type UserResponse = {
  id: number;
  username: string;
  balance: number;
  referralCode: string;
};

export type OtpResponse = {
  otp: string;
  cost: number;
};
