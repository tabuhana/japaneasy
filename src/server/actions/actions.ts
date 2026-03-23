'use server';

import { revalidatePath } from 'next/cache';

import { ActionResponse } from '@/lib/types';
import { calculateNextReview } from '@/lib/srs/algorithm';

import {

  getUserProgress,
} from '../queries';
import {
  batchUpdateToLearning,
  insertReview,

  updateUserWord,
} from '../mutations';
import { getUser } from './auth-actions';

// ── Learn Actions ──

export const getNewCards = async () => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {


    return {
      success: true,
      message: 'New cards fetched',
      data: { cards: [] },
    };
  } catch (error) {
    console.error('Failed to get new cards:', error);
    return { success: false, message: 'Failed to fetch new cards' };
  }
};

export const completeLearnSession = async (
  userWordIds: string[]
) => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {
    await batchUpdateToLearning(userWordIds, user.id);


    revalidatePath('/');
    return { success: true, message: 'Learn session completed' };
  } catch (error) {
    console.error('Failed to complete learn session:', error);
    return { success: false, message: 'Failed to complete learn session' };
  }
};

// ── Study Actions ──

export const getDueCards = async () => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {


    return {
      success: true,
      message: 'Due cards fetched',
      data: { cards: [], count: 0 },
    };
  } catch (error) {
    console.error('Failed to get due cards:', error);
    return { success: false, message: 'Failed to fetch due cards' };
  }
};

// export const submitReview = async (
//   userWordId: string,
//   wasCorrect: boolean,
//   timeSpent?: number
// )=> {
//   const user = await getUser();
//   if (!user) {
//     return { success: false, message: 'Authentication required' };
//   }

//   try {
//     const userWord = await getUserWordById(userWordId);
//     if (!userWord || userWord.userId !== user.id) {
//       return { success: false, message: 'Card not found' };
//     }

//     const srsResult = calculateNextReview(
//       {
//         status: userWord.status,
//         easeFactor: userWord.easeFactor,
//         interval: userWord.interval,
//         repetitions: userWord.repetitions,
//       },
//       wasCorrect
//     );

//     await updateUserWord(userWordId, {
//       status: srsResult.newStatus,
//       interval: srsResult.newInterval,
//       repetitions: srsResult.newRepetitions,
//       easeFactor: srsResult.newEaseFactor,
//       nextReviewDate: srsResult.nextReviewDate,
//       lastReviewedAt: new Date(),
//       timesCorrect: wasCorrect ? userWord.timesCorrect + 1 : userWord.timesCorrect,
//       timesIncorrect: !wasCorrect ? userWord.timesIncorrect + 1 : userWord.timesIncorrect,
//     });

//     await insertReview({
//       userId: user.id,
//       userWordId,
//       wasCorrect,
//       previousInterval: userWord.interval,
//       newInterval: srsResult.newInterval,
//       previousStatus: userWord.status,
//       newStatus: srsResult.newStatus,
//       timeSpent,
//     });

//     if (srsResult.newStatus !== userWord.status) {
//       const word = await getWordById(userWord.wordId);
//       if (word?.unitId) {
//         await syncUnitWordCounts(user.id, word.unitId);
//         await unlockNextWordGroup(user.id, word.unitId);
//       }
//       revalidatePath('/');
//     }

//     return { success: true, message: 'Review submitted' };
//   } catch (error) {
//     console.error('Failed to submit review:', error);
//     return { success: false, message: 'Failed to submit review' };
//   }
// };

// export const getDueCardCount = async (): Promise<ActionResponse<{ count: number }>> => {
//   const user = await getUser();
//   if (!user) {
//     return { success: false, message: 'Authentication required' };
//   }

//   try {
//     const count = await countUserWordsDue(user.id);
//     return {
//       success: true,
//       message: 'Due card count fetched',
//       data: { count },
//     };
//   } catch (error) {
//     console.error('Failed to get due card count:', error);
//     return { success: false, message: 'Failed to fetch due card count' };
//   }
// };
