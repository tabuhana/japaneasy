import { and, eq, inArray } from 'drizzle-orm';

import db from '@/drizzle';
import { userWords } from '@/drizzle/schema';
import { JlptLevelEnum } from '@/drizzle/schema/enums';
import { SRS_CONFIG } from '@/lib/srs/constants';

type CardStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

/**
 * Insert multiple user words (batch add new words to deck)
 */
export const insertUserWords = async (
  words: Array<{
    userId: string;
    wordId: string;
    status: CardStatus;
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReviewDate: Date;
    fromLevel: JlptLevelEnum;
  }>
) => {
  await db.insert(userWords).values(words);
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
    .update(userWords)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(userWords.id, userWordId));
};

/**
 * Batch update cards from 'new' to 'learning' after learn session
 */
export const batchUpdateToLearning = async (userWordIds: string[], userId: string) => {
  await db
    .update(userWords)
    .set({
      status: 'learning',
      interval: SRS_CONFIG.LEARNING_INTERVALS[0],
      repetitions: 0,
      nextReviewDate: new Date(),
      updatedAt: new Date(),
    })
    .where(and(inArray(userWords.id, userWordIds), eq(userWords.userId, userId)));
};

/**
 * Increment correct/incorrect counters
 */
export const updateUserWordCounters = async (
  userWordId: string,
  wasCorrect: boolean,
  currentCorrect: number,
  currentIncorrect: number
) => {
  await db
    .update(userWords)
    .set({
      timesCorrect: wasCorrect ? currentCorrect + 1 : currentCorrect,
      timesIncorrect: !wasCorrect ? currentIncorrect + 1 : currentIncorrect,
      updatedAt: new Date(),
    })
    .where(eq(userWords.id, userWordId));
};
