import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { jlptLevelEnum } from "./enums";
import { user } from "./auth-schema";

export const UserProgress = pgTable('user_progress', {
  userId: text('user_id').primaryKey().references(() => user.id, { onDelete: "cascade" }),
  currentActiveLevel: jlptLevelEnum('current_active_level').notNull().default('N5'),
  streakCount: integer('streak_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
