'use server';

import { JlptLevelEnum } from '@/drizzle/schema/enums';
import { ActionResponse } from '@/lib/types';

import db from '@/drizzle';
import {
  activateLevelProgress,
  completeLevelProgress,
  insertUserLevelProgress,
} from '../mutations/user-level-progress-mutations';
import { updateUserProgressLevel } from '../mutations/user-progress-mutations';
import {
  getActiveLevelProgress,
  getUserLevelProgressByLevel,
  listAllUserLevelProgress,
} from '../queries/user-level-progress-queries';
import { countWordsByLevel } from '../queries/word-queries';
import { getUser } from './auth-actions';

// Level progression order
const JLPT_LEVELS: JlptLevelEnum[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

/**
 * Get next level in progression
 */
const getNextLevel = (currentLevel: JlptLevelEnum): JlptLevelEnum | null => {
  const currentIndex = JLPT_LEVELS.indexOf(currentLevel);
  if (currentIndex === -1 || currentIndex === JLPT_LEVELS.length - 1) {
    return null; // N1 is the final level
  }
  return JLPT_LEVELS[currentIndex + 1];
};

/**
 * Get all level progress for user (for progress dashboard)
 */
export const getAllLevelProgress = async (): Promise<
  ActionResponse<{
    levels: Awaited<ReturnType<typeof listAllUserLevelProgress>>;
  }>
> => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {
    const levels = await listAllUserLevelProgress(user.id);
    return {
      success: true,
      message: 'Level progress fetched',
      data: { levels },
    };
  } catch (error) {
    console.error('Failed to get level progress:', error);
    return { success: false, message: 'Failed to fetch level progress' };
  }
};

/**
 * Check if user is ready to take level completion test
 * Requirements: All words in level must be mastered
 */
export const checkLevelTestEligibility = async (
  level: JlptLevelEnum
): Promise<
  ActionResponse<{
    eligible: boolean;
    wordsMastered: number;
    totalWords: number;
  }>
> => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {
    const levelProgress = await getUserLevelProgressByLevel(user.id, level);
    if (!levelProgress) {
      return { success: false, message: 'Level progress not found' };
    }

    const eligible = levelProgress.wordsMasteredCount >= levelProgress.totalWordsInLevel;

    return {
      success: true,
      message: 'Level test eligibility checked',
      data: {
        eligible,
        wordsMastered: levelProgress.wordsMasteredCount,
        totalWords: levelProgress.totalWordsInLevel,
      },
    };
  } catch (error) {
    console.error('Failed to check test eligibility:', error);
    return { success: false, message: 'Failed to check test eligibility' };
  }
};

/**
 * Complete a level (user passed the test)
 * This unlocks the next level
 */
export const completeLevel = async (
  level: JlptLevelEnum
): Promise<
  ActionResponse<{
    completed: boolean;
    nextLevel: JlptLevelEnum | null;
  }>
> => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {
    // Verify user is eligible to complete this level
    const eligibility = await checkLevelTestEligibility(level);
    if (!eligibility.success || !eligibility.data?.eligible) {
      return {
        success: false,
        message: 'You must master all words before completing this level',
      };
    }

    const nextLevel = getNextLevel(level);

    // Use transaction to ensure atomicity
    await db.transaction(async tx => {
      // Mark current level as completed
      await completeLevelProgress(user.id, level);

      // If there's a next level, unlock and activate it
      if (nextLevel) {
        // Check if next level progress exists
        const nextLevelProgress = await getUserLevelProgressByLevel(user.id, nextLevel);

        if (!nextLevelProgress) {
          // Create next level progress entry
          const totalWords = await countWordsByLevel(nextLevel);
          await insertUserLevelProgress({
            userId: user.id,
            level: nextLevel,
            status: 'active',
            totalWordsInLevel: totalWords,
            startedAt: new Date(),
          });
        } else {
          // Activate existing locked level
          await activateLevelProgress(user.id, nextLevel);
        }

        // Update user's current active level
        await updateUserProgressLevel(user.id, nextLevel);
      }
    });

    return {
      success: true,
      message: nextLevel
        ? `Congratulations! You've completed ${level} and unlocked ${nextLevel}!`
        : `Congratulations! You've completed ${level} - the highest level!`,
      data: {
        completed: true,
        nextLevel,
      },
    };
  } catch (error) {
    console.error('Failed to complete level:', error);
    return { success: false, message: 'Failed to complete level' };
  }
};

/**
 * Initialize all locked levels for a new user
 * Called after creating initial N5 progress
 */
export const initializeAllLevels = async (userId: string): Promise<void> => {
  // N5 should already be created as 'active' during user initialization
  // Create locked entries for N4, N3, N2, N1

  const levelsToCreate: JlptLevelEnum[] = ['N4', 'N3', 'N2', 'N1'];

  await db.transaction(async tx => {
    for (const level of levelsToCreate) {
      const totalWords = await countWordsByLevel(level);
      await insertUserLevelProgress({
        userId,
        level,
        status: 'locked',
        totalWordsInLevel: totalWords,
      });
    }
  });
};

/**
 * Get current active level details
 */
export const getActiveLevelDetails = async (): Promise<
  ActionResponse<{
    level: JlptLevelEnum;
    wordsAdded: number;
    wordsMastered: number;
    totalWords: number;
    progress: number; // percentage
  }>
> => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {
    const activeLevel = await getActiveLevelProgress(user.id);
    if (!activeLevel) {
      return { success: false, message: 'No active level found' };
    }

    const progress =
      activeLevel.totalWordsInLevel > 0
        ? (activeLevel.wordsMasteredCount / activeLevel.totalWordsInLevel) * 100
        : 0;

    return {
      success: true,
      message: 'Active level details fetched',
      data: {
        level: activeLevel.level,
        wordsAdded: activeLevel.wordsAddedCount,
        wordsMastered: activeLevel.wordsMasteredCount,
        totalWords: activeLevel.totalWordsInLevel,
        progress,
      },
    };
  } catch (error) {
    console.error('Failed to get active level details:', error);
    return { success: false, message: 'Failed to fetch active level details' };
  }
};
