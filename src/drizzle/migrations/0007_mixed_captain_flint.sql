CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
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
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_user_progress_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_progress"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_word_id_user_words_id_fk" FOREIGN KEY ("user_word_id") REFERENCES "public"."user_words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_reviews_user_reviewedat" ON "reviews" USING btree ("user_id","reviewed_at");--> statement-breakpoint
CREATE INDEX "idx_reviews_userword_reviewedat" ON "reviews" USING btree ("user_word_id","reviewed_at");