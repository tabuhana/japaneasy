import { eq } from 'drizzle-orm';

import db from '@/drizzle';
import { courses, lessons, words } from '@/drizzle/schema';

import type { CourseFormValues, LessonFormValues, UnitFormValues, WordFormValues } from '@/lib/validations/admin';

// Courses
export const createCourse = async (data: CourseFormValues) => {
  const [course] = await db.insert(courses).values(data).returning();
  return course;
};

export const updateCourse = async (id: string, data: CourseFormValues) => {
  const [course] = await db
    .update(courses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(courses.id, id))
    .returning();
  return course;
};

export const deleteCourse = async (id: string) => {
  await db.delete(courses).where(eq(courses.id, id));
};

// Words
export const createWord = async (data: WordFormValues) => {
  const [word] = await db.insert(words).values(data).returning();
  return word;
};

export const updateWord = async (id: string, data: WordFormValues) => {
  const [word] = await db
    .update(words)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(words.id, id))
    .returning();
  return word;
};

export const deleteWord = async (id: string) => {
  await db.delete(words).where(eq(words.id, id));
};

// Lessons
export const createLesson = async (data: LessonFormValues) => {
  const [lesson] = await db.insert(lessons).values(data).returning();
  return lesson;
};

export const updateLesson = async (id: string, data: LessonFormValues) => {
  const [lesson] = await db
    .update(lessons)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(lessons.id, id))
    .returning();
  return lesson;
};

export const deleteLesson = async (id: string) => {
  await db.delete(lessons).where(eq(lessons.id, id));
};
