import { notFound } from 'next/navigation';

import { getAllCourses, getAllUnits, getLessonById } from '@/server/queries/admin-queries';

import { LessonForm } from '@/components/admin/lesson-form';

export default async function EditLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const [lesson, courses, units] = await Promise.all([
    getLessonById(lessonId),
    getAllCourses(),
    getAllUnits(),
  ]);
  if (!lesson) notFound();

  const unitMap = new Map(units.map(u => [u.id, u]));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Lesson</h1>
      <LessonForm
        initialData={{
          id: lesson.id,
          courseId: lesson.courseId,
          title: lesson.title,
          content: lesson.content ?? '',
          displayOrder: lesson.displayOrder,
        }}
        courses={courses.map(c => ({
          id: c.id,
          title: c.title,
          unitLevel: unitMap.get(c.unitId)?.level ?? '—',
        }))}
      />
    </div>
  );
}
