'use server';

import { cache } from 'react';
import { getUser } from '@/server/actions';
import { and, asc, eq, isNull, lte, sql } from 'drizzle-orm';

import db from '@/drizzle';
import { userProgress, userWordProgress, words } from '@/drizzle/schema';

export const getUserProgress = cache(async () => {
  const user = await getUser();

  if (!user) {
    return null;
  }

  const results = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, user.id),
  });

  return results;
});

export const getUserDictionary = cache(async (userId: string) => {
  const results = await db.query.userWordProgress.findMany({
    where: eq(userWordProgress.userId, userId),
    with: {
      word: true,
    },
  });

  return results;
});

export const getUserNewWords = cache(async () => {
  const user = await getUser();

  if (!user) {
    return null;
  }
  const results = await db.query.userWordProgress.findMany({
    where: and(eq(userWordProgress.userId, user.id), eq(userWordProgress.status, 'new')),
    with: {
      word: true,
    },
  });

  return results;
});

export const getUserReviewsDue = cache(async () => {
  const user = await getUser();

  if (!user) {
    return null;
  }

  const results = await db.query.userWordProgress.findMany({
    where: and(
      eq(userWordProgress.userId, user.id),
      lte(userWordProgress.nextReviewDate, new Date())
    ),
  });

  return results.length;
});
