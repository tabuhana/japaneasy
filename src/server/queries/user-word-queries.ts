import { and, eq, inArray, lte, sql } from 'drizzle-orm';

import db from '@/drizzle';
import { userWords, words } from '@/drizzle/schema';
import { JlptLevelEnum } from '@/drizzle/schema/enums';
import { getUser } from '../actions';

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
export const getUserWordsByLevel = async (level: JlptLevelEnum) => {

  const user = await getUser();
  if (!user) {
    return null;
  }

  const userId = user.id;

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
 * Get all cards with status 'new' (not yet seen by user)
 * Returns cards with word details joined
 */
export const findNewUserWords = async (userId: string) => {
  const newCards = await db
    .select({
      userWord: userWords,
      word: words,
    })
    .from(userWords)
    .innerJoin(words, eq(userWords.wordId, words.id))
    .where(and(eq(userWords.userId, userId), eq(userWords.status, 'new')))
    .orderBy(userWords.addedAt);

  return newCards;
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

/**
 * Get progress for a specific group (how many words added and at reviewing/mastered)
 */
export const getGroupProgress = async (userId: string, level: JlptLevelEnum, group: number) => {
  const result = await db
    .select({
      total: sql<number>`count(*)`,
      reviewingOrMastered: sql<number>`count(*) filter (where ${userWords.status} in ('reviewing', 'mastered'))`,
    })
    .from(userWords)
    .innerJoin(words, eq(userWords.wordId, words.id))
    .where(
      and(
        eq(userWords.userId, userId),
        eq(words.level, level),
        eq(words.wordGroup, group)
      )
    );

  return {
    wordsAdded: Number(result[0]?.total ?? 0),
    wordsAtReviewing: Number(result[0]?.reviewingOrMastered ?? 0),
  };
};

/**
 * Get progress for all groups in a level
 */
export const getAllGroupProgressForLevel = async (userId: string, level: JlptLevelEnum) => {
  const result = await db
    .select({
      group: words.wordGroup,
      totalWords: sql<number>`count(distinct ${words.id})`,
      wordsAdded: sql<number>`count(distinct ${userWords.id})`,
      wordsAtReviewing: sql<number>`count(distinct ${userWords.id}) filter (where ${userWords.status} in ('reviewing', 'mastered'))`,
    })
    .from(words)
    .leftJoin(
      userWords,
      and(eq(userWords.wordId, words.id), eq(userWords.userId, userId))
    )
    .where(eq(words.level, level))
    .groupBy(words.wordGroup)
    .orderBy(words.wordGroup);

  return result.map(row => ({
    group: Number(row.group),
    totalWords: Number(row.totalWords),
    wordsAdded: Number(row.wordsAdded),
    wordsAtReviewing: Number(row.wordsAtReviewing),
  }));
};
