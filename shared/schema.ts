import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const citizens = pgTable("citizens", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  aadharNumber: text("aadhar_number").notNull().unique(),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  address: text("address").notNull(),
  district: text("district").notNull(),
  pincode: text("pincode").notNull(),
  photoUrl: text("photo_url"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  isActive: true,
});

export const insertCitizenSchema = createInsertSchema(citizens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
}).extend({
  aadharNumber: z.string().regex(/^\d{4}-\d{4}-\d{4}$/, "Aadhar number must be in XXXX-XXXX-XXXX format"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  gender: z.enum(["male", "female", "other"]),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const verificationSchema = z.object({
  aadharNumber: z.string().regex(/^\d{4}-\d{4}-\d{4}$/, "Aadhar number must be in XXXX-XXXX-XXXX format"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Citizen = typeof citizens.$inferSelect;
export type InsertCitizen = z.infer<typeof insertCitizenSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type VerificationData = z.infer<typeof verificationSchema>;
