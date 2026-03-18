import { and, eq, sql } from 'drizzle-orm';

import db from '@/drizzle';
import { userLevelProgress } from '@/drizzle/schema';
import { JlptLevelEnum } from '@/drizzle/schema/enums';

/**
 * Insert new level progress entry
 * Used when initializing user or unlocking new level
 */
export const insertUserLevelProgress = async (data: {
  userId: string;
  level: JlptLevelEnum;
  status: 'locked' | 'active' | 'completed';
  totalWordsInLevel: number;
  totalGroupsInLevel?: number;
  startedAt?: Date;
}) => {
  await db.insert(userLevelProgress).values(data);
};

/**
 * Increment words added count for a level
 * Called when new words are added to user's deck
 */
export const incrementWordsAddedCount = async (
  userId: string,
  level: JlptLevelEnum,
  count: number
) => {
  await db
    .update(userLevelProgress)
    .set({
      wordsAddedCount: sql`${userLevelProgress.wordsAddedCount} + ${count}`,
    })
    .where(and(eq(userLevelProgress.userId, userId), eq(userLevelProgress.level, level)));
};

/**
 * Update words mastered count for a level
 * Called when a word reaches "mastered" status
 */
export const updateWordsMasteredCount = async (
  userId: string,
  level: JlptLevelEnum,
  newCount: number
) => {
  await db
    .update(userLevelProgress)
    .set({
      wordsMasteredCount: newCount,
    })
    .where(and(eq(userLevelProgress.userId, userId), eq(userLevelProgress.level, level)));
};

/**
 * Mark level as completed (test passed)
 */
export const completeLevelProgress = async (userId: string, level: JlptLevelEnum) => {
  await db
    .update(userLevelProgress)
    .set({
      status: 'completed',
      testPassedAt: new Date(),
      completedAt: new Date(),
    })
    .where(and(eq(userLevelProgress.userId, userId), eq(userLevelProgress.level, level)));
};

/**
 * Activate a level (change from locked to active)
 */
export const activateLevelProgress = async (userId: string, level: JlptLevelEnum) => {
  await db
    .update(userLevelProgress)
    .set({
      status: 'active',
      startedAt: new Date(),
    })
    .where(and(eq(userLevelProgress.userId, userId), eq(userLevelProgress.level, level)));
};

/**
 * Update current group for a level
 */
export const updateCurrentGroup = async (
  userId: string,
  level: JlptLevelEnum,
  newGroup: number
) => {
  await db
    .update(userLevelProgress)
    .set({ currentGroup: newGroup })
    .where(and(eq(userLevelProgress.userId, userId), eq(userLevelProgress.level, level)));
};

/**
 * Update level progress status
 */
export const updateLevelStatus = async (
  userId: string,
  level: JlptLevelEnum,
  status: 'locked' | 'active' | 'completed'
) => {
  await db
    .update(userLevelProgress)
    .set({ status })
    .where(and(eq(userLevelProgress.userId, userId), eq(userLevelProgress.level, level)));
};
