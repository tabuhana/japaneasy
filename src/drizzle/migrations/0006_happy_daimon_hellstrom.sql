CREATE TABLE "user_level_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"level" "jlpt_level" NOT NULL,
	"status" "level_status" DEFAULT 'locked' NOT NULL,
	"total_words_in_level" integer NOT NULL,
	"words_added_count" integer DEFAULT 0 NOT NULL,
	"words_mastered_count" integer DEFAULT 0 NOT NULL,
	"test_passed_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_level_progress_user_id_level_unique" UNIQUE("user_id","level")
);
--> statement-breakpoint
ALTER TABLE "user_level_progress" ADD CONSTRAINT "user_level_progress_user_id_user_progress_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_progress"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_userlevel_user_status" ON "user_level_progress" USING btree ("user_id","status");