import db from '@/drizzle';
import { reviews } from '@/drizzle/schema';

type CardStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

/**
 * Insert a new review record
 * Creates audit trail of review attempt
 */
export const insertReview = async (data: {
  userId: string;
  userWordId: string;
  wasCorrect: boolean;
  previousInterval: number;
  newInterval: number;
  previousStatus: CardStatus;
  newStatus: CardStatus;
  timeSpent?: number;
}) => {
  await db.insert(reviews).values(data);
};
