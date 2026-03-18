import { and, asc, eq, max, notInArray, sql } from 'drizzle-orm';

import db from '@/drizzle';
import { words } from '@/drizzle/schema';
import { JlptLevelEnum } from '@/drizzle/schema/enums';

/**
 * Get random words from a specific level (excluding already added words)
 * Used for adding new words to user's deck
 */
export const getRandomWordsFromLevel = async (
  level: JlptLevelEnum,
  limit: number,
  excludeWordIds: string[] = []
) => {
  const query = db
    .select()
    .from(words)
    .where(
      excludeWordIds.length > 0
        ? and(eq(words.level, level), notInArray(words.id, excludeWordIds))
        : eq(words.level, level)
    )
    .orderBy(sql`RANDOM()`)
    .limit(limit);

  return await query;
};

/**
 * Get random words from a specific level and group (excluding already added words)
 */
export const getRandomWordsFromGroup = async (
  level: JlptLevelEnum,
  group: number,
  limit: number,
  excludeWordIds: string[] = []
) => {
  const conditions = [eq(words.level, level), eq(words.wordGroup, group)];
  if (excludeWordIds.length > 0) {
    conditions.push(notInArray(words.id, excludeWordIds));
  }

  return await db
    .select()
    .from(words)
    .where(and(...conditions))
    .orderBy(sql`RANDOM()`)
    .limit(limit);
};

/**
 * Get the maximum group number for a level
 */
export const getMaxGroupForLevel = async (level: JlptLevelEnum) => {
  const [result] = await db
    .select({ maxGroup: max(words.wordGroup) })
    .from(words)
    .where(eq(words.level, level));

  return result?.maxGroup ? Number(result.maxGroup) : 0;
};

/**
 * Count total words in a specific group
 */
export const countWordsInGroup = async (level: JlptLevelEnum, group: number) => {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(words)
    .where(and(eq(words.level, level), eq(words.wordGroup, group)));

  return Number(result.count);
};

/**
 * Get total word count for a specific level
 */
export const countWordsByLevel = async (level: JlptLevelEnum) => {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(words)
    .where(eq(words.level, level));

  return Number(result.count);
};

/**
 * Get all groups for a level with their word counts
 * Used during group progress initialization
 */
export const getGroupsWithWordCounts = async (level: JlptLevelEnum) => {
  const result = await db
    .select({
      group: words.wordGroup,
      totalWords: sql<number>`count(*)`,
    })
    .from(words)
    .where(eq(words.level, level))
    .groupBy(words.wordGroup)
    .orderBy(asc(words.wordGroup));

  return result.map(row => ({
    group: Number(row.group),
    totalWords: Number(row.totalWords),
  }));
};

/**
 * Get word by ID
 */
export const getWordById = async (wordId: string) => {
  const [word] = await db.select().from(words).where(eq(words.id, wordId)).limit(1);

  return word ?? null;
};
