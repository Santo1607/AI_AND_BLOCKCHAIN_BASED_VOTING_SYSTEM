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
  constituency: text("constituency").notNull(),
  pincode: text("pincode").notNull(),
  photoUrl: text("photo_url"),
  fingerprintData: text("fingerprint_data"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const elections = pgTable("elections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  status: text("status").notNull().default("upcoming"), // upcoming, active, completed
  votingStartTime: text("voting_start_time").default("08:00"),
  votingEndTime: text("voting_end_time").default("17:00"),
  resultsTime: text("results_time").default("18:00"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  electionId: integer("election_id").notNull(),
  name: text("name").notNull(),
  party: text("party").notNull(),
  constituency: text("constituency").notNull(),
  symbol: text("symbol").notNull(),
  photoUrl: text("photo_url"),
  manifesto: text("manifesto"),
  createdAt: text("created_at").notNull(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  electionId: integer("election_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  voterAadhar: text("voter_aadhar").notNull(),
  blockchainHash: text("blockchain_hash"),
  transactionHash: text("transaction_hash"),
  votedAt: text("voted_at").notNull(),
});

export const voterRegistrations = pgTable("voter_registrations", {
  id: serial("id").primaryKey(),
  citizenId: integer("citizen_id").notNull(),
  voterIdNumber: text("voter_id_number").notNull().unique(),
  registeredAt: text("registered_at").notNull(),
  status: text("status").notNull().default("active"),
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

export const insertElectionSchema = createInsertSchema(elections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
}).extend({
  createdAt: z.string().optional(),
});

export const voteSchema = z.object({
  electionId: z.number(),
  candidateId: z.number(),
  voterAadhar: z.string().regex(/^\d{4}-\d{4}-\d{4}$/, "Aadhar number must be in XXXX-XXXX-XXXX format"),
  blockchainHash: z.string().optional(),
  transactionHash: z.string().optional(),
});

export const voterRegistrationSchema = z.object({
  aadharNumber: z.string().regex(/^\d{4}-\d{4}-\d{4}$/, "Aadhar number must be in XXXX-XXXX-XXXX format"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Citizen = typeof citizens.$inferSelect;
export type InsertCitizen = z.infer<typeof insertCitizenSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type VerificationData = z.infer<typeof verificationSchema>;
export type Election = typeof elections.$inferSelect;
export type InsertElection = z.infer<typeof insertElectionSchema>;
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Vote = typeof votes.$inferSelect;
export type VoteData = z.infer<typeof voteSchema>;
export type VoterRegistration = typeof voterRegistrations.$inferSelect;
export type VoterRegistrationData = z.infer<typeof voterRegistrationSchema>;
