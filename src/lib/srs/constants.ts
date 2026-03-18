// SRS configuration constants
export const SRS_CONFIG = {
  // Intervals for "learning" status
  LEARNING_INTERVALS: [1, 3, 7], // Days: 1 day, 3 days, 7 days

  // Graduating interval (when moving from learning -> reviewing)
  GRADUATING_INTERVAL: 7,

  // Mastery threshold (60 days = ~2 months)
  MASTERY_THRESHOLD: 60,

  // Ease factor bounds
  EASE_FACTOR_MIN: 1.3,
  EASE_FACTOR_MAX: 3.0,
  EASE_FACTOR_DEFAULT: 2.5,

  // Ease adjustments
  EASE_DECREASE_ON_FAIL: 0.2,
  EASE_INCREASE_ON_SUCCESS: 0.1, // Optional: increase ease on consistent success

  // New word addition threshold
  ACCURACY_THRESHOLD: 0.8, // 80%
  NEW_WORDS_BATCH_SIZE: 5,

  // Group advancement threshold (80% of group words at reviewing/mastered)
  GROUP_ADVANCE_THRESHOLD: 0.8,
} as const;
