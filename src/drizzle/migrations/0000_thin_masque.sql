CREATE TYPE "public"."card_status" AS ENUM('new', 'learning', 'reviewing', 'mastered');--> statement-breakpoint
CREATE TYPE "public"."jlpt_level" AS ENUM('N5', 'N4', 'N3', 'N2', 'N1');--> statement-breakpoint
CREATE TYPE "public"."level_status" AS ENUM('locked', 'active', 'completed');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_group_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_level_progress_id" uuid NOT NULL,
	"group_number" integer NOT NULL,
	"status" "level_status" DEFAULT 'locked' NOT NULL,
	"total_words" integer NOT NULL,
	"words_added" integer DEFAULT 0 NOT NULL,
	"words_completed" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_group_progress_user_level_progress_id_group_number_unique" UNIQUE("user_level_progress_id","group_number")
);
--> statement-breakpoint
CREATE TABLE "user_level_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"level" "jlpt_level" NOT NULL,
	"status" "level_status" DEFAULT 'locked' NOT NULL,
	"total_words_in_level" integer NOT NULL,
	"words_mastered_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_level_progress_user_id_level_unique" UNIQUE("user_id","level")
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"user_id" text PRIMARY KEY NOT NULL,
	"current_active_level" "jlpt_level" DEFAULT 'N5' NOT NULL,
	"streak_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "words" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kanji" varchar(100),
	"kana" varchar(100),
	"romaji" varchar(100),
	"english" text,
	"level" "jlpt_level",
	"word_group" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_words" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"word_id" uuid NOT NULL,
	"status" "card_status" DEFAULT 'new' NOT NULL,
	"ease_factor" real DEFAULT 2.5 NOT NULL,
	"interval" integer DEFAULT 0 NOT NULL,
	"repetitions" integer DEFAULT 0 NOT NULL,
	"next_review_date" timestamp NOT NULL,
	"times_correct" integer DEFAULT 0 NOT NULL,
	"times_incorrect" integer DEFAULT 0 NOT NULL,
	"last_reviewed_at" timestamp,
	"from_level" "jlpt_level" NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_words_user_id_word_id_unique" UNIQUE("user_id","word_id")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"user_word_id" uuid NOT NULL,
	"was_correct" boolean NOT NULL,
	"previous_interval" integer NOT NULL,
	"new_interval" integer NOT NULL,
	"previous_status" "card_status" NOT NULL,
	"new_status" "card_status" NOT NULL,
	"time_spent" integer,
	"reviewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_group_progress" ADD CONSTRAINT "user_group_progress_user_level_progress_id_user_level_progress_id_fk" FOREIGN KEY ("user_level_progress_id") REFERENCES "public"."user_level_progress"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_level_progress" ADD CONSTRAINT "user_level_progress_user_id_user_progress_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_progress"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_words" ADD CONSTRAINT "user_words_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_words" ADD CONSTRAINT "user_words_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_user_progress_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_progress"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_word_id_user_words_id_fk" FOREIGN KEY ("user_word_id") REFERENCES "public"."user_words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "idx_userlevel_user_status" ON "user_level_progress" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_words_level" ON "words" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_words_level_group" ON "words" USING btree ("level","word_group");--> statement-breakpoint
CREATE INDEX "idx_userwords_user_nextreview" ON "user_words" USING btree ("user_id","next_review_date");--> statement-breakpoint
CREATE INDEX "idx_userwords_user_status" ON "user_words" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_reviews_user_reviewedat" ON "reviews" USING btree ("user_id","reviewed_at");--> statement-breakpoint
CREATE INDEX "idx_reviews_userword_reviewedat" ON "reviews" USING btree ("user_word_id","reviewed_at");