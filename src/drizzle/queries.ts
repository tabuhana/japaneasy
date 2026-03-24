'use server';

import { cache } from 'react';
import { getUser } from '@/server/actions';
import { and, asc, eq, isNull, lte, sql } from 'drizzle-orm';

import db from '@/drizzle';
import { userProgress, userWordProgress, words } from '@/drizzle/schema';

// ── User Progress Queries ──

export const getUserProgress = cache(async (userId: string) => {
  const [progress] = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .limit(1);

  return progress ?? null;
});

// ── User Word Queries ──

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export const getUserDictionary = cache(async (userId: string) => {
  const results = await db.query.userWordProgress.findMany({
    where: eq(userWordProgress.userId, userId),
    with: {
      word: true,
    },
  });

  return results;
});
