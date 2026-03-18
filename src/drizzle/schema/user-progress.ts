import { index, integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { jlptLevelEnum, levelStatusEnum } from "./enums";

export const userProgress = pgTable('user_progress', {
  userId: text('user_id').primaryKey().references(() => user.id, { onDelete: "cascade" }),
  currentActiveLevel: jlptLevelEnum('current_active_level').notNull().default('N5'),
  streakCount: integer('streak_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const userLevelProgress = pgTable(
  'user_level_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => userProgress.userId, { onDelete: 'cascade' }),
    level: jlptLevelEnum('level').notNull(),
    status: levelStatusEnum('status').notNull().default('locked'),
    totalWordsInLevel: integer('total_words_in_level').notNull(),
    wordsMasteredCount: integer('words_mastered_count').notNull().default(0),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => {
    return {
      uniqueUserLevel: unique().on(table.userId, table.level),
      idxUserlevelUserStatus: index('idx_userlevel_user_status').on(table.userId, table.status),
    };
  }
);

export const userGroupProgress = pgTable(
  'user_group_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userLevelProgressId: uuid('user_level_progress_id')
      .notNull()
      .references(() => userLevelProgress.id, { onDelete: 'cascade' }),
    groupNumber: integer('group_number').notNull(),
    status: levelStatusEnum('status').notNull().default('locked'),
    totalWords: integer('total_words').notNull(),
    wordsAdded: integer('words_added').notNull().default(0),
    wordsCompleted: integer('words_completed').notNull().default(0),
  },
  table => {
    return {
      uniqueUserLevelGroup: unique().on(table.userLevelProgressId, table.groupNumber),
    };
  }
);

