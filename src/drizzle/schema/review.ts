import { relations } from 'drizzle-orm';
import { boolean, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { user } from './auth-schema';
import { cardStatusEnum } from './enums';
import { userWordProgress } from './user-progress';

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  userWordProgressId: uuid('user_word_progress_id')
    .notNull()
    .references(() => userWordProgress.id, { onDelete: 'cascade' }),

  wasCorrect: boolean('was_correct').notNull(),
  previousInterval: integer('previous_interval').notNull(),
  newInterval: integer('new_interval').notNull(),
  previousStatus: cardStatusEnum('previous_status').notNull(),
  newStatus: cardStatusEnum('new_status').notNull(),
  reviewedAt: timestamp('reviewed_at').defaultNow().notNull(),
});

export const reviewRelations = relations(reviews, ({ one }) => ({
  user: one(user, {
    fields: [reviews.userId],
    references: [user.id],
  }),
  userWordProgress: one(userWordProgress, {
    fields: [reviews.userWordProgressId],
    references: [userWordProgress.id],
  }),
}));
