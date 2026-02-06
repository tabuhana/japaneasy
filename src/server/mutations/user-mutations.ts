'use server';

import { and, eq, sql } from 'drizzle-orm';

import db from '@/drizzle';
import { userLevelProgress, userProgress, userWords, words } from '@/drizzle/schema';

export const initializeUserProgress = async (userId: string): Promise<void> => {
  await db.insert(userProgress).values({
    userId,
    currentActiveLevel: 'N5',
  });

  const [wordCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(words)
    .where(eq(words.level, 'N5'));

  await db.insert(userLevelProgress).values({
    userId,
    level: 'N5',
    status: 'active',
    totalWordsInLevel: Number(wordCount.count),
    startedAt: new Date(),
  });

  const initialWords = await db
    .select()
    .from(words)
    .where(eq(words.level, 'N5'))
    .orderBy(sql`RANDOM()`)
    .limit(10);

  const now = new Date();
  await db.insert(userWords).values(
    initialWords.map(word => ({
      userId,
      wordId: word.id,
      status: 'new' as const,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewDate: now,
      fromLevel: 'N5' as const,
    }))
  );

  await db
    .update(userLevelProgress)
    .set({ wordsAddedCount: 10 })
    .where(and(eq(userLevelProgress.userId, userId), eq(userLevelProgress.level, 'N5')));
};
