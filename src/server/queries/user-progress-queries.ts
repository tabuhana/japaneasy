import { eq } from 'drizzle-orm';

import db from '@/drizzle';
import { userProgress } from '@/drizzle/schema';

/**
 * Get user progress by user ID
 * Returns user's current active level and streak info
 */
export const getUserProgressByUserId = async (userId: string) => {
  const [progress] = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .limit(1);

  return progress ?? null;
};
