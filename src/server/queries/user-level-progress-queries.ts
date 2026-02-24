import { and, eq } from 'drizzle-orm';

import db from '@/drizzle';
import { userLevelProgress } from '@/drizzle/schema';
import { JlptLevelEnum } from '@/drizzle/schema/enums';

/**
 * Get user's progress for a specific JLPT level
 */
export const getUserLevelProgressByLevel = async (userId: string, level: JlptLevelEnum) => {
  const [progress] = await db
    .select()
    .from(userLevelProgress)
    .where(and(eq(userLevelProgress.userId, userId), eq(userLevelProgress.level, level)))
    .limit(1);

  return progress ?? null;
};

/**
 * Get all level progress for a user (all 5 JLPT levels)
 */
export const listAllUserLevelProgress = async (userId: string) => {
  const progress = await db
    .select()
    .from(userLevelProgress)
    .where(eq(userLevelProgress.userId, userId))
    .orderBy(userLevelProgress.level); // N5, N4, N3, N2, N1

  return progress;
};

/**
 * Get user's active level progress
 */
export const getActiveLevelProgress = async (userId: string) => {
  const [progress] = await db
    .select()
    .from(userLevelProgress)
    .where(and(eq(userLevelProgress.userId, userId), eq(userLevelProgress.status, 'active')))
    .limit(1);

  return progress ?? null;
};
