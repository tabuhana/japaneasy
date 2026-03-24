import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { user } from './auth-schema';
import { courses, lessons } from './course';
import { cardStatusEnum } from './enums';
import { words } from './word';

export const userProgress = pgTable('user_progress', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  streakCount: integer('streak_count').notNull().default(0),
  lastReviewDate: date('last_review_date'),
  hiraganaQuizPassed: boolean('hiragana_quiz_passed').notNull().default(false),
  katakanaQuizPassed: boolean('katakana_quiz_passed').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userCourseProgress = pgTable(
  'user_course_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, {
        onDelete: 'cascade',
      }),
    currentLessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [unique().on(table.userId, table.courseId)]
);

export const userWordProgress = pgTable(
  'user_word_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    wordId: uuid('word_id')
      .notNull()
      .references(() => words.id, { onDelete: 'cascade' }),
    status: cardStatusEnum('status').notNull().default('new'),
    easeFactor: real('ease_factor').notNull().default(2.5),
    interval: integer('interval').notNull().default(0),
    repetitions: integer('repetitions').notNull().default(0),
    nextReviewDate: timestamp('next_review_date').notNull(),
    timesCorrect: integer('times_correct').notNull().default(0),
    streakCount: integer('streak_count').notNull().default(0),
    timesIncorrect: integer('times_incorrect').notNull().default(0),
    lastReviewedAt: timestamp('last_reviewed_at'),
    addedAt: timestamp('added_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => {
    return {
      uniqueUserWord: unique().on(table.userId, table.wordId),
      idxUserwordsUserNextreview: index('idx_userwords_user_nextreview').on(
        table.userId,
        table.nextReviewDate
      ),
      idxUserwordsUserStatus: index('idx_userwords_user_status').on(table.userId, table.status),
    };
  }
);

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(user, {
    fields: [userProgress.userId],
    references: [user.id],
  }),
}));

export const userCourseProgressRelations = relations(userCourseProgress, ({ one }) => ({
  user: one(user, {
    fields: [userCourseProgress.userId],
    references: [user.id],
  }),
  course: one(courses, {
    fields: [userCourseProgress.courseId],
    references: [courses.id],
  }),
}));

export const userWordProgressRelations = relations(userWordProgress, ({ one }) => ({
  user: one(user, {
    fields: [userWordProgress.userId],
    references: [user.id],
  }),
  word: one(words, {
    fields: [userWordProgress.wordId],
    references: [words.id],
  }),
}));
