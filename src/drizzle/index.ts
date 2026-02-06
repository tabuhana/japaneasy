import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const connection = process.env.DATABASE_URL!;

const client =  postgres(connection, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

const db = drizzle(client, { schema });

export default db;
export type Database = typeof db;
