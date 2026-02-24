import { and, eq, lte, sql } from 'drizzle-orm';

import db from '@/drizzle';
import { userWords, words } from '@/drizzle/schema';
import { JlptLevelEnum } from '@/drizzle/schema/enums';

/**
 * Get all cards due for review (nextReviewDate <= now)
 * Returns cards with word details joined
 */
export const findUserWordsDue = async (userId: string) => {
  const dueCards = await db
    .select({
      userWord: userWords,
      word: words,
    })
    .from(userWords)
    .innerJoin(words, eq(userWords.wordId, words.id))
    .where(and(eq(userWords.userId, userId), lte(userWords.nextReviewDate, new Date())))
    .orderBy(userWords.nextReviewDate); // Oldest due cards first

  return dueCards;
};

/**
 * Get count of due cards for a user
 */
export const countUserWordsDue = async (userId: string) => {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userWords)
    .where(and(eq(userWords.userId, userId), lte(userWords.nextReviewDate, new Date())));

  return Number(result.count);
};

/**
 * Get a specific user word by ID
 */
export const getUserWordById = async (userWordId: string) => {
  const [userWord] = await db
    .select()
    .from(userWords)
    .where(eq(userWords.id, userWordId))
    .limit(1);

  return userWord ?? null;
};

/**
 * Get all user words for a specific level
 */
export const getUserWordsByLevel = async (userId: string, level: JlptLevelEnum) => {
  const userWordsList = await db
    .select({
      userWord: userWords,
      word: words,
    })
    .from(userWords)
    .innerJoin(words, eq(userWords.wordId, words.id))
    .where(and(eq(userWords.userId, userId), eq(userWords.fromLevel, level)));

  return userWordsList;
};

/**
 * Get IDs of words the user already has
 */
export const getUserWordIds = async (userId: string) => {
  const existingWords = await db
    .select({ wordId: userWords.wordId })
    .from(userWords)
    .where(eq(userWords.userId, userId));

  return existingWords.map(w => w.wordId);
};

/**
 * Count mastered words for a specific level
 */
export const countMasteredWordsByLevel = async (userId: string, level: JlptLevelEnum) => {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userWords)
    .where(
      and(
        eq(userWords.userId, userId),
        eq(userWords.fromLevel, level),
        eq(userWords.status, 'mastered')
      )
    );

  return Number(result.count);
};
