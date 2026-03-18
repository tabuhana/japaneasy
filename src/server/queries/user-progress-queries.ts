import { and, asc, eq, getTableColumns } from 'drizzle-orm';

import db from '@/drizzle';
import {
  JlptLevelEnum,
  userGroupProgress,
  userLevelProgress,
  userProgress,
} from '@/drizzle/schema';

type QueryRow = Awaited<ReturnType<typeof getAllLevelProgressWithGroups>>[number];

type LevelWithGroups = Omit<
  QueryRow,
  'groupNumber' | 'groupStatus' | 'totalWords' | 'wordsAdded' | 'wordsCompleted'
> & {
  groups: {
    group: number;
    status: NonNullable<QueryRow['groupStatus']>;
    totalWords: number;
    wordsAdded: number;
    wordsCompleted: number;
  }[];
};

/**
 * Get user progress by user ID
 * Returns user's current active level and streak info
 */
export const getUserProgress = async (userId: string) => {
  const [progress] = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .limit(1);

  return progress ?? null;
};

export const getAllLevelProgressWithGroups = async (userId: string) => {
  return await db
    .select({
      level: userLevelProgress.level,
      status: userLevelProgress.status,
      totalWordsInLevel: userLevelProgress.totalWordsInLevel,
      wordsMasteredCount: userLevelProgress.wordsMasteredCount,
      startedAt: userLevelProgress.startedAt,
      completedAt: userLevelProgress.completedAt,
      createdAt: userLevelProgress.createdAt,
      groupNumber: userGroupProgress.groupNumber,
      groupStatus: userGroupProgress.status,
      totalWords: userGroupProgress.totalWords,
      wordsAdded: userGroupProgress.wordsAdded,
      wordsCompleted: userGroupProgress.wordsCompleted,
    })
    .from(userLevelProgress)
    .leftJoin(userGroupProgress, eq(userGroupProgress.userLevelProgressId, userLevelProgress.id))
    .where(eq(userLevelProgress.userId, userId))
    .orderBy(userLevelProgress.level, asc(userGroupProgress.groupNumber));
};

export const getGroupProgressByLevel = async (userId: string, level: JlptLevelEnum) => {
  return await db
    .select({ ...getTableColumns(userGroupProgress) })
    .from(userGroupProgress)
    .innerJoin(userLevelProgress, eq(userGroupProgress.userLevelProgressId, userLevelProgress.id))
    .where(and(eq(userLevelProgress.userId, userId), eq(userLevelProgress.level, level)))
    .orderBy(asc(userGroupProgress.groupNumber));
};
