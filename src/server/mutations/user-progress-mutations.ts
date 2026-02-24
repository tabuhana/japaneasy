import { eq, sql } from 'drizzle-orm';

import db from '@/drizzle';
import { userProgress } from '@/drizzle/schema';
import { JlptLevelEnum } from '@/drizzle/schema/enums';

/**
 * Update user's current active level
 * Used when progressing to next JLPT level
 */
export const updateUserProgressLevel = async (userId: string, newLevel: JlptLevelEnum) => {
  await db
    .update(userProgress)
    .set({
      currentActiveLevel: newLevel,
      updatedAt: new Date(),
    })
    .where(eq(userProgress.userId, userId));
};

/**
 * Increment user's streak count
 */
export const incrementUserStreak = async (userId: string) => {
  await db
    .update(userProgress)
    .set({
      streakCount: sql`${userProgress.streakCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(userProgress.userId, userId));
};

/**
 * Reset user's streak count to 0
 */
export const resetUserStreak = async (userId: string) => {
  await db
    .update(userProgress)
    .set({
      streakCount: 0,
      updatedAt: new Date(),
    })
    .where(eq(userProgress.userId, userId));
};
