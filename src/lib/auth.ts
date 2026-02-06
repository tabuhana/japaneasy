import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

import db from '@/drizzle';
import { userProgress } from '@/drizzle/schema/user-progress';

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
          await db.insert(userProgress).values({
            userId: user.id,
          });
        },
      },
    },
  },
  plugins: [nextCookies()],
});
