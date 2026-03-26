'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/server/actions';
import { and, eq, inArray } from 'drizzle-orm';

import { SRS_CONFIG } from '@/lib/srs/constants';

import db from '.';
import { userWordProgress } from './schema';

export const completeLearnSession = async (wordIds: string[]) => {
  const user = await getUser();

  if (!user) {
    return null;
  }

  try {
    await db
      .update(userWordProgress)
      .set({
        status: 'learning',
        interval: SRS_CONFIG.LEARNING_INTERVALS[0],
        repetitions: 0,
        nextReviewDate: (() => {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          return d;
        })(),
        updatedAt: new Date(),
      })
      .where(and(inArray(userWordProgress.id, wordIds), eq(userWordProgress.userId, user.id)));

    revalidatePath('/');
    revalidatePath('/study');
    return;
  } catch (error) {
    console.error('Failed to complete learn session:', error);
    return null;
  }
};
