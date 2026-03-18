import { pgTable, uuid, varchar, text, timestamp, index, integer } from 'drizzle-orm/pg-core';
import { jlptLevelEnum } from './enums';

export const words = pgTable('words', {
  id: uuid('id').defaultRandom().primaryKey(),
  kanji: varchar('kanji', { length: 100 }),
  kana: varchar('kana', { length: 100 }),
  romaji: varchar('romaji', { length: 100 }),
  english: text('english'),
  level: jlptLevelEnum('level'),
  wordGroup: integer('word_group'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_words_level').on(table.level),
  index('idx_words_level_group').on(table.level, table.wordGroup),
]);