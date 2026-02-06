'use server';

import db from '@/drizzle';
import { userProgress } from '@/drizzle/schema/user-progress';

import { getUser } from './auth-actions';

export const createUserProgress = async () => {
  const user = await getUser();
  if (!user) {
    throw new Error('User is required');
  }

  try {
    await db.insert(userProgress).values({
      userId: user.id,
    });
  } catch {
    throw new Error('Errorr creating userProgress');
  }
};
