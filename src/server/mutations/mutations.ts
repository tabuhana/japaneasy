'use server';

import { revalidatePath } from 'next/cache';
import { and, asc, eq, inArray } from 'drizzle-orm';

import db from '@/drizzle';
import { reviews, userWordProgress, words } from '@/drizzle/schema';

import { SRS_CONFIG } from '@/lib/srs/constants';

type CardStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

// ── User Word Mutations ──

/**
 * Insert multiple user words (batch add new words to deck)
 */
export const insertUserWords = async (
  wordsToInsert: Array<{
    userId: string;
    wordId: string;
    status: CardStatus;
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReviewDate: Date;
  }>
) => {
  await db.insert(userWordProgress).values(wordsToInsert);
};

/**
 * Update user word after review (SRS algorithm output)
 */
export const updateUserWord = async (
  userWordId: string,
  updates: {
    status: CardStatus;
    interval: number;
    repetitions: number;
    easeFactor: number;
    nextReviewDate: Date;
    lastReviewedAt: Date;
    timesCorrect: number;
    timesIncorrect: number;
  }
) => {
  await db
    .update(userWordProgress)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(userWordProgress.id, userWordId));
};

/**
 * Batch update cards from 'new' to 'learning' after learn session
 */
export const batchUpdateToLearning = async (userWordIds: string[], userId: string) => {
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
    .where(and(inArray(userWordProgress.id, userWordIds), eq(userWordProgress.userId, userId)));
};

// ── Review Mutations ──

/**
 * Insert a new review record
 * Creates audit trail of review attempt
 */
export const insertReview = async (data: {
  userId: string;
  userWordProgressId: string;
  wasCorrect: boolean;
  previousInterval: number;
  newInterval: number;
  previousStatus: CardStatus;
  newStatus: CardStatus;
  timeSpent?: number;
}) => {
  await db.insert(reviews).values(data);
};

// ── User Initialization ──

const INITIAL_WORDS_COUNT = 10;

export const initializeUserProgress = async (userId: string): Promise<void> => {
  const initialWords = await db
    .select()
    .from(words)
    .orderBy(asc(words.displayOrder), asc(words.id))
    .limit(INITIAL_WORDS_COUNT);

  if (initialWords.length > 0) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    await db.insert(userWordProgress).values(
      initialWords.map(word => ({
        userId,
        wordId: word.id,
        status: 'new' as const,
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: now,
      }))
    );
  }
  revalidatePath('/');
};
