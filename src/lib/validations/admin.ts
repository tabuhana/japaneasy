import { z } from 'zod';

export const unitSchema = z.object({
  level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0),
  totalWords: z.number().int().min(0).optional(),
  isPublished: z.boolean(),
  color: z.string().max(20).optional(),
});

export const courseSchema = z.object({
  unitId: z.string().uuid('Invalid unit'),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0),
  isPublished: z.boolean(),
});

export const wordSchema = z.object({
  kanji: z.string().max(100).optional(),
  kana: z.string().max(100).optional(),
  romaji: z.string().max(100).optional(),
  english: z.string().optional(),
  partOfSpeech: z.string().max(50).optional(),
  wordGroup: z.string().max(50).optional(),
  level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1', 'N0']),
  displayOrder: z.number().int(),
});

export const lessonSchema = z.object({
  courseId: z.string().uuid('Invalid course'),
  title: z.string().min(1, 'Title is required').max(100),
  content: z.string().optional(),
  displayOrder: z.number().int().min(0),
});

export type UnitFormValues = z.infer<typeof unitSchema>;
export type CourseFormValues = z.infer<typeof courseSchema>;
export type WordFormValues = z.infer<typeof wordSchema>;
export type LessonFormValues = z.infer<typeof lessonSchema>;
