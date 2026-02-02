import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import db from '@/drizzle';
import { UserProgress } from '@/drizzle/schema/userProgress';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async user => {
          await db.insert(UserProgress).values({
            userId: user.id,
          });
        },
      },
    },
  },
  plugins: [nextCookies()],
});
