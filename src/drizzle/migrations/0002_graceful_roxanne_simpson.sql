CREATE TABLE "words" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kanji" varchar(100),
	"kana" varchar(100),
	"romaji" varchar(100),
	"english" text,
	"level" "jlpt_level",
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_words_level" ON "words" USING btree ("level");