import { and, desc, eq, sql } from 'drizzle-orm';

import db from '@/drizzle';
import { reviews, userWords, words } from '@/drizzle/schema';
import { JlptLevelEnum } from '@/drizzle/schema/enums';

/**
 * Get recent reviews for accuracy calculation
 * Used to determine if user is ready to add new words (80% threshold)
 */
export const getRecentReviewsForAccuracy = async (userId: string, level: JlptLevelEnum) => {
  const accuracyResult = await db
    .select({
      correct: sql<number>`SUM(CASE WHEN ${reviews.wasCorrect} THEN 1 ELSE 0 END)`,
      total: sql<number>`COUNT(*)`,
    })
    .from(reviews)
    .innerJoin(userWords, eq(reviews.userWordId, userWords.id))
    .innerJoin(words, eq(userWords.wordId, words.id))
    .where(and(eq(reviews.userId, userId), eq(words.level, level)));

  const { correct, total } = accuracyResult[0];

  return {
    correct: Number(correct) || 0,
    total: Number(total) || 0,
    accuracy: Number(total) > 0 ? Number(correct) / Number(total) : 0,
  };
};

/**
 * Get review history for a specific card
 */
export const getReviewHistoryByUserWordId = async (userWordId: string, limit: number = 50) => {
  const history = await db
    .select()
    .from(reviews)
    .where(eq(reviews.userWordId, userWordId))
    .orderBy(desc(reviews.reviewedAt))
    .limit(limit);

  return history;
};

/**
 * Get user's recent review activity
 */
export const getRecentUserReviews = async (userId: string, limit: number = 50) => {
  const recentReviews = await db
    .select({
      review: reviews,
      word: words,
    })
    .from(reviews)
    .innerJoin(userWords, eq(reviews.userWordId, userWords.id))
    .innerJoin(words, eq(userWords.wordId, words.id))
    .where(eq(reviews.userId, userId))
    .orderBy(desc(reviews.reviewedAt))
    .limit(limit);

  return recentReviews;
};
