'use server';

import { and, asc, eq, sql } from 'drizzle-orm';

import db from '@/drizzle';
import { userGroupProgress, userLevelProgress, userProgress, userWords, words } from '@/drizzle/schema';
import { JlptLevelEnum } from '@/drizzle/schema/enums';

const INITIAL_WORDS_COUNT = 10;
const ALL_LEVELS: JlptLevelEnum[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

export const initializeUserProgress = async (userId: string): Promise<void> => {
  await db.transaction(async tx => {
    // Create user progress record
    await tx.insert(userProgress).values({
      userId,
      currentActiveLevel: 'N5',
    });

    // Create level progress and group progress for all levels
    for (const level of ALL_LEVELS) {
      const isN5 = level === 'N5';

      const [wordCount] = await tx
        .select({ count: sql<number>`count(*)` })
        .from(words)
        .where(eq(words.level, level));

      const [levelRow] = await tx
        .insert(userLevelProgress)
        .values({
          userId,
          level,
          status: isN5 ? 'active' : 'locked',
          totalWordsInLevel: Number(wordCount.count),
          startedAt: isN5 ? new Date() : undefined,
        })
        .returning({ id: userLevelProgress.id });

      // Get distinct groups with word counts for this level
      const groups = await tx
        .select({ groupNumber: words.wordGroup, count: sql<number>`count(*)` })
        .from(words)
        .where(eq(words.level, level))
        .groupBy(words.wordGroup)
        .orderBy(asc(words.wordGroup));

      if (groups.length > 0) {
        await tx.insert(userGroupProgress).values(
          groups.map((g, i) => ({
            userLevelProgressId: levelRow.id,
            groupNumber: g.groupNumber!,
            status: (isN5 && i === 0 ? 'active' : 'locked') as 'active' | 'locked',
            totalWords: Number(g.count),
          }))
        );
      }
    }

    // Add initial 10 N5 words from Group 1
    const initialWords = await tx
      .select()
      .from(words)
      .where(and(eq(words.level, 'N5'), eq(words.wordGroup, 1)))
      .orderBy(asc(words.id))
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
    }
  });
};
