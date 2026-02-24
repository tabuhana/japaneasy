import { and, eq, notInArray, sql } from 'drizzle-orm';

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
 * Get word by ID
 */
export const getWordById = async (wordId: string) => {
  const [word] = await db.select().from(words).where(eq(words.id, wordId)).limit(1);

  return word ?? null;
};
