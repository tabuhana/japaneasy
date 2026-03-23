import { describe, it, expect } from 'bun:test';
import { calculateNextReview, shouldAddNewWords } from '../algorithm';
import { SRS_CONFIG } from '../constants';

describe('SRS Algorithm', () => {
  describe('calculateNextReview', () => {
    describe('New cards', () => {
      it('should move new card to learning on correct answer', () => {
        const card = {
          status: 'new' as const,
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
        };

        const result = calculateNextReview(card, true);

        expect(result.newStatus).toBe('learning');
        expect(result.newInterval).toBe(SRS_CONFIG.LEARNING_INTERVALS[0]); // 1 day
        expect(result.newRepetitions).toBe(1);
        expect(result.newEaseFactor).toBe(2.5); // Unchanged
      });

      it('should move new card to learning on incorrect answer', () => {
        const card = {
          status: 'new' as const,
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
        };

        const result = calculateNextReview(card, false);

        expect(result.newStatus).toBe('learning');
        expect(result.newInterval).toBe(SRS_CONFIG.LEARNING_INTERVALS[0]); // 1 day
        expect(result.newRepetitions).toBe(0);
        expect(result.newEaseFactor).toBe(2.3); // Decreased by 0.2
      });
    });

    describe('Learning cards', () => {
      it('should progress through learning intervals on correct answers', () => {
        // First learning step (1 day)
        const card1 = {
          status: 'learning' as const,
          interval: 1,
          repetitions: 1,
          easeFactor: 2.5,
        };

        const result1 = calculateNextReview(card1, true);
        expect(result1.newStatus).toBe('learning');
        expect(result1.newInterval).toBe(3); // Second interval
        expect(result1.newRepetitions).toBe(2);

        // Second learning step (3 days)
        const card2 = {
          status: 'learning' as const,
          interval: 3,
          repetitions: 2,
          easeFactor: 2.5,
        };

        const result2 = calculateNextReview(card2, true);
        // After 3 successful reviews (repetitions becomes 3 >= LEARNING_INTERVALS.length),
        // card should graduate to reviewing
        expect(result2.newStatus).toBe('reviewing');
        expect(result2.newInterval).toBe(SRS_CONFIG.GRADUATING_INTERVAL); // 7 days
        expect(result2.newRepetitions).toBe(3);
      });

      it('should graduate to reviewing after completing learning intervals', () => {
        const card = {
          status: 'learning' as const,
          interval: 7,
          repetitions: 3, // Completed all learning intervals
          easeFactor: 2.5,
        };

        const result = calculateNextReview(card, true);

        expect(result.newStatus).toBe('reviewing');
        expect(result.newInterval).toBe(SRS_CONFIG.GRADUATING_INTERVAL); // 7 days
        expect(result.newRepetitions).toBe(4);
      });

      it('should reset learning card on incorrect answer', () => {
        const card = {
          status: 'learning' as const,
          interval: 3,
          repetitions: 2,
          easeFactor: 2.5,
        };

        const result = calculateNextReview(card, false);

        expect(result.newStatus).toBe('learning');
        expect(result.newInterval).toBe(SRS_CONFIG.LEARNING_INTERVALS[0]); // Reset to 1 day
        expect(result.newRepetitions).toBe(0);
        expect(result.newEaseFactor).toBe(2.3); // Decreased ease
      });
    });

    describe('Reviewing cards', () => {
      it('should apply ease factor to increase interval on correct answer', () => {
        const card = {
          status: 'reviewing' as const,
          interval: 7,
          repetitions: 4,
          easeFactor: 2.5,
        };

        const result = calculateNextReview(card, true);

        expect(result.newStatus).toBe('reviewing');
        expect(result.newInterval).toBe(Math.round(7 * 2.5)); // 18 days
        expect(result.newRepetitions).toBe(5);
        expect(result.newEaseFactor).toBe(2.5);
      });

      it('should promote to mastered when interval reaches threshold', () => {
        const card = {
          status: 'reviewing' as const,
          interval: 30,
          repetitions: 8,
          easeFactor: 2.5,
        };

        const result = calculateNextReview(card, true);

        expect(result.newStatus).toBe('mastered');
        expect(result.newInterval).toBe(Math.round(30 * 2.5)); // 75 days
        expect(result.newInterval).toBeGreaterThanOrEqual(SRS_CONFIG.MASTERY_THRESHOLD);
      });

      it('should reset to learning on incorrect answer', () => {
        const card = {
          status: 'reviewing' as const,
          interval: 21,
          repetitions: 6,
          easeFactor: 2.5,
        };

        const result = calculateNextReview(card, false);

        expect(result.newStatus).toBe('learning');
        expect(result.newInterval).toBe(SRS_CONFIG.LEARNING_INTERVALS[0]); // Reset to 1 day
        expect(result.newRepetitions).toBe(0);
        expect(result.newEaseFactor).toBe(2.3); // Decreased ease
      });
    });

    describe('Mastered cards', () => {
      it('should continue increasing interval for mastered cards', () => {
        const card = {
          status: 'mastered' as const,
          interval: 90,
          repetitions: 12,
          easeFactor: 2.5,
        };

        const result = calculateNextReview(card, true);

        expect(result.newStatus).toBe('mastered');
        expect(result.newInterval).toBe(Math.round(90 * 2.5)); // 225 days
        expect(result.newRepetitions).toBe(13);
      });

      it('should reset mastered card to learning on failure', () => {
        const card = {
          status: 'mastered' as const,
          interval: 120,
          repetitions: 15,
          easeFactor: 2.5,
        };

        const result = calculateNextReview(card, false);

        expect(result.newStatus).toBe('learning');
        expect(result.newInterval).toBe(SRS_CONFIG.LEARNING_INTERVALS[0]); // Reset to 1 day
        expect(result.newRepetitions).toBe(0);
        expect(result.newEaseFactor).toBe(2.3); // Decreased ease
      });
    });

    describe('Ease factor adjustments', () => {
      it('should decrease ease factor on incorrect answers', () => {
        const card = {
          status: 'reviewing' as const,
          interval: 14,
          repetitions: 5,
          easeFactor: 2.5,
        };

        const result = calculateNextReview(card, false);
        expect(result.newEaseFactor).toBe(2.3); // 2.5 - 0.2
      });

      it('should not decrease ease factor below minimum', () => {
        const card = {
          status: 'reviewing' as const,
          interval: 14,
          repetitions: 5,
          easeFactor: 1.3, // Already at minimum
        };

        const result = calculateNextReview(card, false);
        expect(result.newEaseFactor).toBe(SRS_CONFIG.EASE_FACTOR_MIN); // Should stay at 1.3
      });

      it('should maintain ease factor on correct answers (by default)', () => {
        const card = {
          status: 'reviewing' as const,
          interval: 14,
          repetitions: 5,
          easeFactor: 2.5,
        };

        const result = calculateNextReview(card, true);
        expect(result.newEaseFactor).toBe(2.5); // Unchanged (optional increase is commented out)
      });
    });

    describe('Next review date calculation', () => {
      it('should set next review date based on interval', () => {
        const now = new Date();
        const card = {
          status: 'reviewing' as const,
          interval: 7,
          repetitions: 4,
          easeFactor: 2.5,
        };

        const result = calculateNextReview(card, true);

        const expectedDate = new Date(now);
        expectedDate.setDate(expectedDate.getDate() + result.newInterval);
        expectedDate.setHours(0, 0, 0, 0);

        // Dates should match exactly since both are normalized to midnight
        expect(result.nextReviewDate.getTime()).toBe(expectedDate.getTime());
      });
    });
  });

  describe('shouldAddNewWords', () => {
    it('should return true when accuracy is exactly 80%', () => {
      expect(shouldAddNewWords(80, 100)).toBe(true);
      expect(shouldAddNewWords(40, 50)).toBe(true);
      expect(shouldAddNewWords(8, 10)).toBe(true);
    });

    it('should return true when accuracy is above 80%', () => {
      expect(shouldAddNewWords(90, 100)).toBe(true);
      expect(shouldAddNewWords(85, 100)).toBe(true);
      expect(shouldAddNewWords(100, 100)).toBe(true);
    });

    it('should return false when accuracy is below 80%', () => {
      expect(shouldAddNewWords(79, 100)).toBe(false);
      expect(shouldAddNewWords(50, 100)).toBe(false);
      expect(shouldAddNewWords(7, 10)).toBe(false);
    });

    it('should return false when total count is 0', () => {
      expect(shouldAddNewWords(0, 0)).toBe(false);
    });

    it('should handle edge cases correctly', () => {
      expect(shouldAddNewWords(1, 1)).toBe(true); // 100% accuracy
      expect(shouldAddNewWords(0, 1)).toBe(false); // 0% accuracy
    });
  });
});
