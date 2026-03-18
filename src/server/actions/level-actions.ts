'use server';

import { JlptLevelEnum } from '@/drizzle/schema/enums';

import { ActionResponse } from '@/lib/types';

import { getAllLevelProgressWithGroups } from '../queries';
import { getUser } from './auth-actions';

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
export const getAllLevelProgress = async (): Promise<
  ActionResponse<{
    levels: LevelWithGroups[];
  }>
> => {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, message: 'Authentication required' };
    }
    const rows = await getAllLevelProgressWithGroups(user.id);

    const byLevel = Map.groupBy(rows, r => r.level);
    const levelsWithGroups: LevelWithGroups[] = [...byLevel.entries()].map(([level, levelRows]) => {
      const { groupNumber, groupStatus, totalWords, wordsAdded, wordsCompleted, ...levelData } =
        levelRows[0];
      return {
        ...levelData,
        level,
        groups: levelRows
          .filter(r => r.groupNumber !== null)
          .map(r => ({
            group: r.groupNumber!,
            status: r.groupStatus!,
            totalWords: r.totalWords!,
            wordsAdded: r.wordsAdded!,
            wordsCompleted: r.wordsCompleted!,
          })),
      };
    });

    return { success: true, message: 'Level progress fetched', data: { levels: levelsWithGroups } };
  } catch (error) {
    console.error('Failed to get level progress:', error);
    return { success: false, message: 'Failed to fetch level progress' };
  }
};
