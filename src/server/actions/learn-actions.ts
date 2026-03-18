'use server';

import { ActionResponse } from '@/lib/types';

import { batchUpdateToLearning } from '../mutations/user-word-mutations';
import { findNewUserWords } from '../queries/user-word-queries';
import { getUser } from './auth-actions';

export const getNewCards = async (): Promise<
  ActionResponse<{
    cards: Awaited<ReturnType<typeof findNewUserWords>>;
  }>
> => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {
    const cards = await findNewUserWords(user.id);

    return {
      success: true,
      message: 'New cards fetched',
      data: { cards },
    };
  } catch (error) {
    console.error('Failed to get new cards:', error);
    return { success: false, message: 'Failed to fetch new cards' };
  }
};

export const completeLearnSession = async (
  userWordIds: string[]
): Promise<ActionResponse> => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {
    await batchUpdateToLearning(userWordIds, user.id);

    return { success: true, message: 'Learn session completed' };
  } catch (error) {
    console.error('Failed to complete learn session:', error);
    return { success: false, message: 'Failed to complete learn session' };
  }
};
