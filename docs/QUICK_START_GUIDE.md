# Quick Start Guide - SRS Implementation

This guide helps you integrate the SRS backend with your frontend components.

## 📁 File Structure

```
src/
├── server/
│   ├── queries/           # Database read operations
│   │   ├── user-progress-queries.ts
│   │   ├── user-level-progress-queries.ts
│   │   ├── user-word-queries.ts
│   │   ├── word-queries.ts
│   │   ├── review-queries.ts
│   │   └── index.ts       # All exports
│   │
│   ├── mutations/         # Database write operations
│   │   ├── user-progress-mutations.ts
│   │   ├── user-level-progress-mutations.ts
│   │   ├── user-word-mutations.ts
│   │   ├── review-mutations.ts
│   │   ├── user-mutations.ts
│   │   └── index.ts       # All exports
│   │
│   └── actions/           # Server actions (use in components)
│       ├── auth-actions.ts
│       ├── user-actions.ts
│       ├── study-actions.ts
│       ├── level-actions.ts
│       └── index.ts       # All exports
│
└── lib/
    └── srs/
        ├── algorithm.ts   # SRS algorithm logic
        ├── constants.ts   # SRS configuration
        └── __tests__/
            └── algorithm.test.ts
```

---

## 🎯 Common Use Cases

### 1. Dashboard - Show Study Stats

```typescript
// In your dashboard component
import { getStudyStats } from '@/server/actions';

export default async function DashboardPage() {
  const result = await getStudyStats();

  if (!result.success) {
    return <div>Error: {result.message}</div>;
  }

  const { dueCount, streakCount, currentLevel, accuracy } = result.data;

  return (
    <div>
      <h2>Welcome back!</h2>
      <p>Due cards: {dueCount}</p>
      <p>Streak: {streakCount} days 🔥</p>
      <p>Current level: {currentLevel}</p>
      <p>Accuracy: {(accuracy * 100).toFixed(1)}%</p>
    </div>
  );
}
```

### 2. Study Session - Review Cards

```typescript
'use client';

import { useState } from 'react';
import { getDueCards, submitReview, addNewWords } from '@/server/actions';

export default function StudyPage() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load due cards on mount
  useEffect(() => {
    async function loadCards() {
      const result = await getDueCards();
      if (result.success) {
        setCards(result.data.cards);
      }
    }
    loadCards();
  }, []);

  const handleAnswer = async (wasCorrect: boolean) => {
    const currentCard = cards[currentIndex];

    // Submit review to backend
    const result = await submitReview({
      userWordId: currentCard.userWord.id,
      wasCorrect,
      timeSpent: 10, // optional
    });

    if (result.success) {
      // Move to next card
      setCurrentIndex(prev => prev + 1);

      // Check if session complete
      if (currentIndex === cards.length - 1) {
        // Try to add new words
        await addNewWords();
      }
    }
  };

  if (currentIndex >= cards.length) {
    return <div>Session complete! 🎉</div>;
  }

  const current = cards[currentIndex];

  return (
    <div>
      <h2>{current.word.kanji || current.word.kana}</h2>
      <p>{current.word.romaji}</p>
      <button onClick={() => handleAnswer(true)}>Correct ✅</button>
      <button onClick={() => handleAnswer(false)}>Wrong ❌</button>
    </div>
  );
}
```

### 3. Level Progress - Show All Levels

```typescript
import { getAllLevelProgress } from '@/server/actions';

export default async function ProgressPage() {
  const result = await getAllLevelProgress();

  if (!result.success) {
    return <div>Error loading progress</div>;
  }

  const { levels } = result.data;

  return (
    <div>
      <h1>Your Progress</h1>
      {levels.map(level => (
        <div key={level.level}>
          <h3>{level.level}</h3>
          <p>Status: {level.status}</p>
          <progress
            value={level.wordsMasteredCount}
            max={level.totalWordsInLevel}
          />
          <p>
            {level.wordsMasteredCount} / {level.totalWordsInLevel} mastered
          </p>
        </div>
      ))}
    </div>
  );
}
```

### 4. Level Completion - Take Test

```typescript
'use client';

import { checkLevelTestEligibility, completeLevel } from '@/server/actions';

export default function LevelTestPage({ level }: { level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' }) {
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    async function checkEligibility() {
      const result = await checkLevelTestEligibility(level);
      if (result.success) {
        setEligible(result.data.eligible);
      }
    }
    checkEligibility();
  }, [level]);

  const handleTestComplete = async (passed: boolean) => {
    if (passed) {
      const result = await completeLevel(level);
      if (result.success) {
        alert(result.message); // "Congratulations! You've completed N5 and unlocked N4!"
      }
    }
  };

  if (!eligible) {
    return <div>You must master all words before taking the test</div>;
  }

  return (
    <div>
      <h2>{level} Level Test</h2>
      {/* Your test component */}
      <button onClick={() => handleTestComplete(true)}>
        Submit Test
      </button>
    </div>
  );
}
```

---

## 🔧 Server Actions Reference

### Study Actions

```typescript
import {
  getDueCards,        // Get all cards due for review
  getDueCardCount,    // Get count of due cards (lightweight)
  submitReview,       // Submit a review answer
  addNewWords,        // Add 5 new words (checks 80% accuracy)
  getStudyStats       // Get dashboard stats
} from '@/server/actions/study-actions';

// Example: Submit a review
const result = await submitReview({
  userWordId: 'uuid',
  wasCorrect: true,
  timeSpent: 15 // optional, in seconds
});
// Returns: { success: true, data: { nextReviewDate, newStatus, newInterval } }
```

### Level Actions

```typescript
import {
  getAllLevelProgress,          // Get all 5 levels progress
  checkLevelTestEligibility,    // Check if ready for test
  completeLevel,                // Complete level + unlock next
  getActiveLevelDetails         // Get current level details
} from '@/server/actions/level-actions';

// Example: Complete a level
const result = await completeLevel('N5');
// Returns: { success: true, data: { completed: true, nextLevel: 'N4' } }
```

---

## 🧪 Testing

### Run Unit Tests
```bash
npm test                # Run all tests
npm run test:watch      # Watch mode for development
```

### Verify Database Indexes
```bash
npm run db:verify-indexes
```

This will run `EXPLAIN ANALYZE` on all critical queries and show you:
- Which indexes are being used
- Whether sequential scans are happening (bad!)
- Estimated query performance

---

## 🎨 SRS Configuration

You can customize the SRS algorithm in `src/lib/srs/constants.ts`:

```typescript
export const SRS_CONFIG = {
  LEARNING_INTERVALS: [1, 3, 7],     // Days between learning reviews
  GRADUATING_INTERVAL: 7,            // First reviewing interval
  MASTERY_THRESHOLD: 60,             // Days to reach "mastered"
  EASE_FACTOR_MIN: 1.3,              // Minimum difficulty
  EASE_FACTOR_MAX: 3.0,              // Maximum difficulty
  EASE_FACTOR_DEFAULT: 2.5,          // Starting difficulty
  EASE_DECREASE_ON_FAIL: 0.2,        // Penalty for wrong answers
  ACCURACY_THRESHOLD: 0.8,           // 80% accuracy to add new words
  NEW_WORDS_BATCH_SIZE: 5,           // Words added at once
};
```

---

## 📊 Database Schema Reminder

### User Progress
- `userId` - Better Auth user ID
- `currentActiveLevel` - N5, N4, N3, N2, or N1
- `streakCount` - Consecutive study days

### User Level Progress
- `level` - Which JLPT level (N5-N1)
- `status` - locked | active | completed
- `wordsAddedCount` - How many words added
- `wordsMasteredCount` - How many reached mastered status
- `totalWordsInLevel` - Total words available

### User Words (SRS Cards)
- `status` - new | learning | reviewing | mastered
- `easeFactor` - 1.3 to 3.0 (difficulty)
- `interval` - Days until next review
- `repetitions` - Correct answers in a row
- `nextReviewDate` - When card is due
- `timesCorrect` / `timesIncorrect` - Lifetime counters

### Reviews (Audit Trail)
- `wasCorrect` - Boolean
- `previousInterval` / `newInterval`
- `previousStatus` / `newStatus`
- `timeSpent` - Optional

---

## 🔐 Authentication

All server actions automatically check authentication using `getUser()`:

```typescript
const user = await getUser();
if (!user) {
  return { success: false, message: 'Authentication required' };
}
```

Make sure Better Auth session is active before calling any actions.

---

## ⚡ Performance Tips

1. **Use `getDueCardCount()` for dashboard** - Much faster than `getDueCards()`
2. **Cache study stats** - Consider caching with 5-minute TTL
3. **Batch operations** - All critical operations use transactions
4. **Index verification** - Run `npm run db:verify-indexes` after any schema changes

---

## 🐛 Debugging

### Check Database Connection
```bash
npm run db:studio  # Opens Drizzle Studio
```

### View Logs
All actions log errors to console:
```typescript
console.error('Failed to submit review:', error);
```

### Test SRS Algorithm
```bash
npm test src/lib/srs/__tests__/algorithm.test.ts
```

---

## 📝 Type Safety

All actions return `ActionResponse<T>`:

```typescript
type ActionResponse<T = void> = {
  success: boolean;
  message?: string;
  data?: T;
};
```

Always check `success` before accessing `data`:

```typescript
const result = await getDueCards();
if (result.success) {
  const { cards } = result.data; // Type-safe!
} else {
  console.error(result.message);
}
```

---

## 🎓 Next Steps

1. **Build UI components** using the server actions
2. **Add loading states** for async operations
3. **Implement optimistic updates** for better UX
4. **Add error boundaries** for error handling
5. **Consider caching** for frequently accessed data

---

**Questions?** Check `IMPLEMENTATION_SUMMARY.md` for detailed architecture info.
