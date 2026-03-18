'use server';

import { ActionResponse } from '@/lib/types';
import { calculateNextReview } from '@/lib/srs/algorithm';

import { getUserWordById } from '../queries/user-word-queries';
import {
  countUserWordsDue,
  findUserWordsDue,
} from '../queries/user-word-queries';
import { updateUserWord } from '../mutations/user-word-mutations';
import { insertReview } from '../mutations/review-mutations';
import { getUser } from './auth-actions';

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

export const submitReview = async (
  userWordId: string,
  wasCorrect: boolean,
  timeSpent?: number
): Promise<ActionResponse> => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {
    const userWord = await getUserWordById(userWordId);
    if (!userWord || userWord.userId !== user.id) {
      return { success: false, message: 'Card not found' };
    }

    const srsResult = calculateNextReview(
      {
        status: userWord.status,
        easeFactor: userWord.easeFactor,
        interval: userWord.interval,
        repetitions: userWord.repetitions,
      },
      wasCorrect
    );

    await updateUserWord(userWordId, {
      status: srsResult.newStatus,
      interval: srsResult.newInterval,
      repetitions: srsResult.newRepetitions,
      easeFactor: srsResult.newEaseFactor,
      nextReviewDate: srsResult.nextReviewDate,
      lastReviewedAt: new Date(),
      timesCorrect: wasCorrect ? userWord.timesCorrect + 1 : userWord.timesCorrect,
      timesIncorrect: !wasCorrect ? userWord.timesIncorrect + 1 : userWord.timesIncorrect,
    });

    await insertReview({
      userId: user.id,
      userWordId,
      wasCorrect,
      previousInterval: userWord.interval,
      newInterval: srsResult.newInterval,
      previousStatus: userWord.status,
      newStatus: srsResult.newStatus,
      timeSpent,
    });

    return { success: true, message: 'Review submitted' };
  } catch (error) {
    console.error('Failed to submit review:', error);
    return { success: false, message: 'Failed to submit review' };
  }
};

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
