import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

import db from '@/drizzle';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      isAdmin: {
        type: 'boolean',
        defaultValue: false,
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
});
