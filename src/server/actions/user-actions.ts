'use server';

import { getUser } from '@/server/actions/auth-actions';

import { ActionResponse } from '@/lib/types';

import { initializeUserProgress } from '../mutations/user-mutations';

export const createUserProgress = async (): Promise<ActionResponse> => {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Authentication required' };
  }

  try {
    await initializeUserProgress(user.id);
    return { success: true, message: 'Welcome to Japaneasy!' };
  } catch (error) {
    console.error('Failed to create user progress:', error);
    return { success: false, message: 'Failed to initialize your progress. Please try again.' };
  }
};
