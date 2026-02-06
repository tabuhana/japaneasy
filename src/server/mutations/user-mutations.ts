'use server';

import { and, eq, sql } from 'drizzle-orm';

import db from '@/drizzle';
import { userLevelProgress, userProgress, userWords, words } from '@/drizzle/schema';

const INITIAL_WORDS_COUNT = 10;

export const initializeUserProgress = async (userId: string): Promise<void> => {
  await db.transaction(async tx => {
    await tx.insert(userProgress).values({
      userId,
      currentActiveLevel: 'N5',
    });

    const [wordCount] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(words)
      .where(eq(words.level, 'N5'));

    await tx.insert(userLevelProgress).values({
      userId,
      level: 'N5',
      status: 'active',
      totalWordsInLevel: Number(wordCount.count),
      startedAt: new Date(),
    });

    const initialWords = await tx
      .select()
      .from(words)
      .where(eq(words.level, 'N5'))
      .orderBy(sql`RANDOM()`) // This isnt optimal, but its a good enough solution for now
      .limit(INITIAL_WORDS_COUNT);

    if (initialWords.length > 0) {
      const now = new Date();
      await tx.insert(userWords).values(
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

      await tx
        .update(userLevelProgress)
        .set({ wordsAddedCount: initialWords.length })
        .where(and(eq(userLevelProgress.userId, userId), eq(userLevelProgress.level, 'N5')));
    }
  });
};
