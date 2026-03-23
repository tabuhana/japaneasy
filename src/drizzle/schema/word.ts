import { index, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { jlptLevelEnum } from './enums';

export const words = pgTable(
  'words',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    kanji: varchar('kanji', { length: 100 }),
    kana: varchar('kana', { length: 100 }),
    romaji: varchar('romaji', { length: 100 }),
    english: text('english'),
    partOfSpeech: varchar('part_of_speech', { length: 50 }),
    wordGroup: varchar('word_group', { length: 50 }),
    level: jlptLevelEnum('level'),
    displayOrder: integer('display_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    index('idx_words_level').on(table.level),
    index('idx_words_level_group').on(table.level, table.wordGroup),
    index('idx_words_level_order').on(table.level, table.displayOrder),
  ]
);
