import { boolean, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { cardStatusEnum } from './enums';
import { userProgress } from './user-progress';
import { userWords } from './user-word';

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: text('user_id')
    .notNull()
    .references(() => userProgress.userId, { onDelete: 'cascade' }),
  userWordId: uuid('user_word_id')
    .notNull()
    .references(() => userWords.id, { onDelete: 'cascade' }),

  wasCorrect: boolean('was_correct').notNull(),

  previousInterval: integer('previous_interval').notNull(),
  newInterval: integer('new_interval').notNull(),
  previousStatus: cardStatusEnum('previous_status').notNull(),
  newStatus: cardStatusEnum('new_status').notNull(),

  timeSpent: integer('time_spent'),

  reviewedAt: timestamp('reviewed_at').defaultNow().notNull(),
}, (table) => {
  return {
    idxReviewsUserReviewedat: index('idx_reviews_user_reviewedat').on(table.userId, table.reviewedAt),
    idxReviewsUserwordReviewedat: index('idx_reviews_userword_reviewedat').on(table.userWordId, table.reviewedAt),
  };
});
