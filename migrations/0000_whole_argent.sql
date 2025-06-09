CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "admins_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"election_id" integer NOT NULL,
	"name" text NOT NULL,
	"party" text NOT NULL,
	"constituency" text NOT NULL,
	"symbol" text NOT NULL,
	"photo_url" text,
	"manifesto" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "citizens" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"aadhar_number" text NOT NULL,
	"date_of_birth" text NOT NULL,
	"gender" text NOT NULL,
	"address" text NOT NULL,
	"district" text NOT NULL,
	"constituency" text NOT NULL,
	"pincode" text NOT NULL,
	"photo_url" text,
	"fingerprint_data" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "citizens_aadhar_number_unique" UNIQUE("aadhar_number")
);
--> statement-breakpoint
CREATE TABLE "elections" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"voting_start_time" text DEFAULT '08:00',
	"voting_end_time" text DEFAULT '17:00',
	"results_time" text DEFAULT '18:00',
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voter_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"citizen_id" integer NOT NULL,
	"voter_id_number" text NOT NULL,
	"registered_at" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	CONSTRAINT "voter_registrations_voter_id_number_unique" UNIQUE("voter_id_number")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"election_id" integer NOT NULL,
	"candidate_id" integer NOT NULL,
	"voter_aadhar" text NOT NULL,
	"blockchain_hash" text,
	"transaction_hash" text,
	"voted_at" text NOT NULL
);
