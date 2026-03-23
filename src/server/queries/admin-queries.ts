import { asc, count, eq } from 'drizzle-orm';

import db from '@/drizzle';
import { courses, lessons, words } from '@/drizzle/schema';


export const getAllCourses = async () => {
  const query = db.select().from(courses);
  return await query.orderBy(asc(courses.displayOrder));
};

export const getCourseById = async (id: string) => {
  const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return course ?? null;
};

export const getAllWords = async () => {
  const query = db.select().from(words);

  return await query.orderBy(asc(words.displayOrder));
};

export const getPaginatedWords = async (
  page: number,
  pageSize: number,
) => {

  const [items, [{ total }]] = await Promise.all([
    db.select().from(words).orderBy(asc(words.displayOrder)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ total: count() }).from(words),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
};

// Lessons
export const getAllLessons = async (courseId?: string) => {
  const query = db.select().from(lessons);
  if (courseId) {
    return await query.where(eq(lessons.courseId, courseId)).orderBy(asc(lessons.displayOrder));
  }
  return await query.orderBy(asc(lessons.displayOrder));
};

export const getLessonById = async (id: string) => {
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return lesson ?? null;
};

export const getAdminWordById = async (id: string) => {
  const [word] = await db.select().from(words).where(eq(words.id, id)).limit(1);
  return word ?? null;
};
