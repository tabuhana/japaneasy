import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  displayOrder: integer('display_order').notNull(),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    content: text('content'),
    imageUrl: text('image_url'),
    displayOrder: integer('display_order').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    index('idx_lessons_course').on(table.courseId),
    index('idx_lessons_course_order').on(table.courseId, table.displayOrder),
  ]
);

export const courseRelations = relations(courses, ({ many }) => ({
  lessons: many(lessons),
}));

export const lessonRelations = relations(lessons, ({ one }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
}));
