'use server';

import { getUser } from '@/server/actions/auth-actions';
import {
  createCourse,
  createLesson,
  createWord,
  deleteCourse,
  deleteLesson,
  deleteWord,
  updateCourse,
  updateLesson,
  updateWord,
} from '@/server/mutations/admin-mutations';
import {
  getAdminWordById,
  getAllCourses,
  getAllLessons,
  getAllWords,
  getCourseById,
  getLessonById,
} from '@/server/queries/admin-queries';

import type { ActionResponse } from '@/lib/types';
import { courseSchema, lessonSchema, unitSchema, wordSchema } from '@/lib/validations/admin';

async function requireAdmin() {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');
  if (!user.isAdmin) throw new Error('Not authorized');
  return user;
}

// Courses
export async function getCoursesAction(): Promise<
  ActionResponse<Awaited<ReturnType<typeof getAllCourses>>>
> {
  try {
    await requireAdmin();
    const data = await getAllCourses();
    return { success: true, message: 'Courses fetched', data };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch courses',
    };
  }
}

export async function getCourseAction(
  id: string
): Promise<ActionResponse<Awaited<ReturnType<typeof getCourseById>>>> {
  try {
    await requireAdmin();
    const data = await getCourseById(id);
    if (!data) return { success: false, message: 'Course not found' };
    return { success: true, message: 'Course fetched', data };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch course',
    };
  }
}

export async function createCourseAction(formData: unknown): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const parsed = courseSchema.safeParse(formData);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
    await createCourse(parsed.data);
    return { success: true, message: 'Course created' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create course',
    };
  }
}

export async function updateCourseAction(id: string, formData: unknown): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const parsed = courseSchema.safeParse(formData);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
    await updateCourse(id, parsed.data);
    return { success: true, message: 'Course updated' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update course',
    };
  }
}

export async function deleteCourseAction(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin();
    await deleteCourse(id);
    return { success: true, message: 'Course deleted' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete course',
    };
  }
}

// Words
export async function getWordsAction(): Promise<
  ActionResponse<Awaited<ReturnType<typeof getAllWords>>>
> {
  try {
    await requireAdmin();
    const data = await getAllWords();
    return { success: true, message: 'Words fetched', data };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch words',
    };
  }
}

export async function getWordAction(
  id: string
): Promise<ActionResponse<Awaited<ReturnType<typeof getAdminWordById>>>> {
  try {
    await requireAdmin();
    const data = await getAdminWordById(id);
    if (!data) return { success: false, message: 'Word not found' };
    return { success: true, message: 'Word fetched', data };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch word',
    };
  }
}

export async function createWordAction(formData: unknown): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const parsed = wordSchema.safeParse(formData);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
    await createWord(parsed.data);
    return { success: true, message: 'Word created' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create word',
    };
  }
}

export async function updateWordAction(id: string, formData: unknown): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const parsed = wordSchema.safeParse(formData);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
    await updateWord(id, parsed.data);
    return { success: true, message: 'Word updated' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update word',
    };
  }
}

export async function deleteWordAction(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin();
    await deleteWord(id);
    return { success: true, message: 'Word deleted' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete word',
    };
  }
}

// Lessons
export async function getLessonsAction(
  courseId?: string
): Promise<ActionResponse<Awaited<ReturnType<typeof getAllLessons>>>> {
  try {
    await requireAdmin();
    const data = await getAllLessons(courseId);
    return { success: true, message: 'Lessons fetched', data };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch lessons',
    };
  }
}

export async function getLessonAction(
  id: string
): Promise<ActionResponse<Awaited<ReturnType<typeof getLessonById>>>> {
  try {
    await requireAdmin();
    const data = await getLessonById(id);
    if (!data) return { success: false, message: 'Lesson not found' };
    return { success: true, message: 'Lesson fetched', data };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch lesson',
    };
  }
}

export async function createLessonAction(formData: unknown): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const parsed = lessonSchema.safeParse(formData);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
    await createLesson(parsed.data);
    return { success: true, message: 'Lesson created' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create lesson',
    };
  }
}

export async function updateLessonAction(id: string, formData: unknown): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const parsed = lessonSchema.safeParse(formData);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
    await updateLesson(id, parsed.data);
    return { success: true, message: 'Lesson updated' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update lesson',
    };
  }
}

export async function deleteLessonAction(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin();
    await deleteLesson(id);
    return { success: true, message: 'Lesson deleted' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete lesson',
    };
  }
}
