import Link from 'next/link';

import { getAllCourses, getAllLessons, getAllUnits } from '@/server/queries/admin-queries';

import { Button } from '@/components/ui/button';

import { LessonDeleteButton } from './lesson-delete-button';
import { LessonFilter } from './lesson-filter';

export default async function AdminLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const { courseId } = await searchParams;
  const [lessons, courses, units] = await Promise.all([
    getAllLessons(courseId),
    getAllCourses(),
    getAllUnits(),
  ]);

  const unitMap = new Map(units.map(u => [u.id, u]));
  const courseMap = new Map(
    courses.map(c => {
      const unit = unitMap.get(c.unitId);
      return [c.id, { ...c, unitLevel: unit?.level ?? '—' }];
    })
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lessons</h1>
        <Link href="/admin/lessons/new">
          <Button>Create Lesson</Button>
        </Link>
      </div>
      <div className="mb-4">
        <LessonFilter
          courses={courses.map(c => ({
            id: c.id,
            title: c.title,
            unitLevel: unitMap.get(c.unitId)?.level ?? '—',
          }))}
          currentCourseId={courseId}
        />
      </div>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Order</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Course</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No lessons found.
                </td>
              </tr>
            ) : (
              lessons.map(lesson => {
                const course = courseMap.get(lesson.courseId);
                return (
                  <tr key={lesson.id} className="border-b">
                    <td className="px-4 py-3 text-sm">{lesson.displayOrder}</td>
                    <td className="px-4 py-3 text-sm">
                      {course ? `${course.unitLevel} — ${course.title}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">{lesson.title}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/lessons/${lesson.id}/edit`}>
                          <Button variant="default" size="sm">Edit</Button>
                        </Link>
                        <LessonDeleteButton lessonId={lesson.id} lessonTitle={lesson.title} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
