import { SRS_CONFIG } from './constants';

type CardStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

type SRSCard = {
  status: CardStatus;
  interval: number;
  repetitions: number;
  easeFactor: number;
}

type SRSResult = {
  newStatus: CardStatus;
  newInterval: number;
  newRepetitions: number;
  newEaseFactor: number;
  nextReviewDate: Date;
}

/**
 * Calculate next review based on SRS algorithm (Anki-style)
 * @param card Current card state
 * @param wasCorrect Did user answer correctly?
 * @returns Updated card state with next review date
 */
export function calculateNextReview(
  card: SRSCard,
  wasCorrect: boolean
): SRSResult {
  const now = new Date();
  let newStatus = card.status;
  let newInterval = card.interval;
  let newRepetitions = card.repetitions;
  let newEaseFactor = card.easeFactor;

  if (wasCorrect) {
    // CORRECT ANSWER LOGIC

    if (card.status === 'new') {
      // First time seeing this card
      newStatus = 'learning';
      newInterval = SRS_CONFIG.LEARNING_INTERVALS[0]; // 1 day
      newRepetitions = 1;
    } else if (card.status === 'learning') {
      // Still in learning phase
      newRepetitions++;

      // Check if ready to graduate to reviewing
      if (newRepetitions >= SRS_CONFIG.LEARNING_INTERVALS.length) {
        newStatus = 'reviewing';
        newInterval = SRS_CONFIG.GRADUATING_INTERVAL; // 7 days
      } else {
        newInterval = SRS_CONFIG.LEARNING_INTERVALS[newRepetitions - 1];
      }
    } else if (card.status === 'reviewing' || card.status === 'mastered') {
      // Apply ease factor for reviewing/mastered cards
      newRepetitions++;
      newInterval = Math.round(card.interval * card.easeFactor);

      // Optional: Increase ease factor slightly on success
      // newEaseFactor = Math.min(
      //   SRS_CONFIG.EASE_FACTOR_MAX,
      //   card.easeFactor + SRS_CONFIG.EASE_INCREASE_ON_SUCCESS
      // );

      // Check if reached mastery threshold
      if (newInterval >= SRS_CONFIG.MASTERY_THRESHOLD) {
        newStatus = 'mastered';
      }
    }
  } else {
    // INCORRECT ANSWER LOGIC

    // Decrease ease factor (make card harder)
    newEaseFactor = Math.max(
      SRS_CONFIG.EASE_FACTOR_MIN,
      card.easeFactor - SRS_CONFIG.EASE_DECREASE_ON_FAIL
    );

    // Reset to learning phase
    if (card.status === 'reviewing' || card.status === 'mastered') {
      newStatus = 'learning';
      newInterval = SRS_CONFIG.LEARNING_INTERVALS[0]; // 1 day
      newRepetitions = 0;
    } else if (card.status === 'learning') {
      // Stay in learning, reset interval
      newInterval = SRS_CONFIG.LEARNING_INTERVALS[0]; // 1 day
      newRepetitions = 0;
    } else {
      // 'new' card answered wrong on first try
      newStatus = 'learning';
      newInterval = SRS_CONFIG.LEARNING_INTERVALS[0];
      newRepetitions = 0;
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    newStatus,
    newInterval,
    newRepetitions,
    newEaseFactor,
    nextReviewDate,
  };
}

/**
 * Check if user is ready to add more words based on 80% accuracy
 * @param correctCount Number of correct reviews
 * @param totalCount Total number of reviews
 * @returns True if accuracy >= 80%
 */
export function shouldAddNewWords(
  correctCount: number,
  totalCount: number
): boolean {
  if (totalCount === 0) return false;
  const accuracy = correctCount / totalCount;
  return accuracy >= SRS_CONFIG.ACCURACY_THRESHOLD;
}
