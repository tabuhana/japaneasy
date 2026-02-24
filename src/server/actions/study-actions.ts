'use server';

import { calculateNextReview, shouldAddNewWords } from '@/lib/srs/algorithm';
import { SRS_CONFIG } from '@/lib/srs/constants';
import { ActionResponse } from '@/lib/types';

import db from '@/drizzle';
import { insertReview } from '../mutations/review-mutations';
import { incrementWordsAddedCount } from '../mutations/user-level-progress-mutations';
import { insertUserWords, updateUserWord } from '../mutations/user-word-mutations';
import { getRecentReviewsForAccuracy } from '../queries/review-queries';
import { getUserProgressByUserId } from '../queries/user-progress-queries';
import {
  countUserWordsDue,
  findUserWordsDue,
  getUserWordById,
  getUserWordIds
} from '../queries/user-word-queries';
import { getRandomWordsFromLevel } from '../queries/word-queries';
import { getUser } from './auth-actions';

/**
 * Get all cards due for review today
 */
export const getDueCards = async (): Promise<
  ActionResponse<{
    cards: Awaited<ReturnType<typeof findUserWordsDue>>;
    count: number;
  }>
> => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {
    const cards = await findUserWordsDue(user.id);
    const count = cards.length;

    return {
      success: true,
      message: 'Due cards fetched',
      data: { cards, count },
    };
  } catch (error) {
    console.error('Failed to get due cards:', error);
    return { success: false, message: 'Failed to fetch due cards' };
  }
};

/**
 * Get count of due cards (lightweight for dashboard)
 */
export const getDueCardCount = async (): Promise<ActionResponse<{ count: number }>> => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {
    const count = await countUserWordsDue(user.id);
    return {
      success: true,
      message: 'Due card count fetched',
      data: { count },
    };
  } catch (error) {
    console.error('Failed to get due card count:', error);
    return { success: false, message: 'Failed to fetch due card count' };
  }
};

/**
 * Submit a review answer and update SRS state
 */
export const submitReview = async (data: {
  userWordId: string;
  wasCorrect: boolean;
  timeSpent?: number;
}): Promise<
  ActionResponse<{
    nextReviewDate: Date;
    newStatus: string;
    newInterval: number;
  }>
> => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {
    const { userWordId, wasCorrect, timeSpent } = data;

    // Get current card state
    const card = await getUserWordById(userWordId);
    if (!card) {
      return { success: false, message: 'Card not found' };
    }

    // Verify this card belongs to the user
    if (card.userId !== user.id) {
      return { success: false, message: 'Unauthorized' };
    }

    // Calculate next review using SRS algorithm
    const result = calculateNextReview(
      {
        status: card.status,
        interval: card.interval,
        repetitions: card.repetitions,
        easeFactor: card.easeFactor,
      },
      wasCorrect
    );

    // Use transaction to ensure atomicity
    await db.transaction(async tx => {
      // Update user word with new SRS state
      await updateUserWord(userWordId, {
        status: result.newStatus,
        interval: result.newInterval,
        repetitions: result.newRepetitions,
        easeFactor: result.newEaseFactor,
        nextReviewDate: result.nextReviewDate,
        lastReviewedAt: new Date(),
        timesCorrect: wasCorrect ? card.timesCorrect + 1 : card.timesCorrect,
        timesIncorrect: !wasCorrect ? card.timesIncorrect + 1 : card.timesIncorrect,
      });

      // Insert review record for audit trail
      await insertReview({
        userId: user.id,
        userWordId,
        wasCorrect,
        previousInterval: card.interval,
        newInterval: result.newInterval,
        previousStatus: card.status,
        newStatus: result.newStatus,
        timeSpent,
      });
    });

    return {
      success: true,
      message: 'Review submitted successfully',
      data: {
        nextReviewDate: result.nextReviewDate,
        newStatus: result.newStatus,
        newInterval: result.newInterval,
      },
    };
  } catch (error) {
    console.error('Failed to submit review:', error);
    return { success: false, message: 'Failed to submit review' };
  }
};

/**
 * Add new words to user's deck (checks 80% accuracy threshold)
 */
export const addNewWords = async (): Promise<
  ActionResponse<{
    wordsAdded: number;
  }>
> => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {
    // Get user's current active level
    const progress = await getUserProgressByUserId(user.id);
    if (!progress) {
      return { success: false, message: 'User progress not found' };
    }

    const currentLevel = progress.currentActiveLevel;

    // Calculate accuracy from review history
    const { correct, total, accuracy } = await getRecentReviewsForAccuracy(
      user.id,
      currentLevel
    );

    // Check if ready to add more words (80% accuracy)
    if (!shouldAddNewWords(correct, total)) {
      return {
        success: false,
        message: `Current accuracy is ${(accuracy * 100).toFixed(1)}%. Keep practicing to reach 80%!`,
        data: { wordsAdded: 0 },
      };
    }

    // Get IDs of words user already has
    const existingWordIds = await getUserWordIds(user.id);

    // Get random new words from current level
    const newWords = await getRandomWordsFromLevel(
      currentLevel,
      SRS_CONFIG.NEW_WORDS_BATCH_SIZE,
      existingWordIds
    );

    if (newWords.length === 0) {
      return {
        success: false,
        message: 'No new words available for this level',
        data: { wordsAdded: 0 },
      };
    }

    // Add new words to user's deck
    const now = new Date();
    const newUserWords = newWords.map(word => ({
      userId: user.id,
      wordId: word.id,
      status: 'new' as const,
      easeFactor: SRS_CONFIG.EASE_FACTOR_DEFAULT,
      interval: 0,
      repetitions: 0,
      nextReviewDate: now, // Available for review immediately
      fromLevel: currentLevel,
    }));

    // Use transaction to ensure atomicity
    await db.transaction(async tx => {
      // Insert new user words
      await insertUserWords(newUserWords);

      // Update level progress counter
      await incrementWordsAddedCount(user.id, currentLevel, newWords.length);
    });

    return {
      success: true,
      message: `Added ${newWords.length} new words!`,
      data: {
        wordsAdded: newWords.length,
      },
    };
  } catch (error) {
    console.error('Failed to add new words:', error);
    return { success: false, message: 'Failed to add new words' };
  }
};

/**
 * Get study statistics for dashboard
 */
export const getStudyStats = async (): Promise<
  ActionResponse<{
    dueCount: number;
    streakCount: number;
    currentLevel: string;
    accuracy: number;
  }>
> => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {
    const [dueCount, progress] = await Promise.all([
      countUserWordsDue(user.id),
      getUserProgressByUserId(user.id),
    ]);

    if (!progress) {
      return { success: false, message: 'User progress not found' };
    }

    // Get accuracy for current level
    const { accuracy } = await getRecentReviewsForAccuracy(user.id, progress.currentActiveLevel);

    return {
      success: true,
      message: 'Study statistics fetched',
      data: {
        dueCount,
        streakCount: progress.streakCount,
        currentLevel: progress.currentActiveLevel,
        accuracy,
      },
    };
  } catch (error) {
    console.error('Failed to get study stats:', error);
    return { success: false, message: 'Failed to fetch study statistics' };
  }
};
