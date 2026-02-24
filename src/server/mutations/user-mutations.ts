'use server';

import { and, eq, sql } from 'drizzle-orm';

import db from '@/drizzle';
import { userLevelProgress, userProgress, userWords, words } from '@/drizzle/schema';
import { JlptLevelEnum } from '@/drizzle/schema/enums';

const INITIAL_WORDS_COUNT = 10;

export const initializeUserProgress = async (userId: string): Promise<void> => {
  await db.transaction(async tx => {
    // Create user progress record
    await tx.insert(userProgress).values({
      userId,
      currentActiveLevel: 'N5',
    });

    const [wordCount] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(words)
      .where(eq(words.level, 'N5'));

    // Create N5 level progress (active)
    await tx.insert(userLevelProgress).values({
      userId,
      level: 'N5',
      status: 'active',
      totalWordsInLevel: Number(wordCount.count),
      startedAt: new Date(),
    });

    // Create locked entries for N4, N3, N2, N1
    const levelsToCreate: JlptLevelEnum[] = ['N4', 'N3', 'N2', 'N1'];
    for (const level of levelsToCreate) {
      const [levelWordCount] = await tx
        .select({ count: sql<number>`count(*)` })
        .from(words)
        .where(eq(words.level, level));

      await tx.insert(userLevelProgress).values({
        userId,
        level,
        status: 'locked',
        totalWordsInLevel: Number(levelWordCount.count),
      });
    }

    // Add initial 10 N5 words
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
