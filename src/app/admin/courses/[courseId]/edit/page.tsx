import { notFound } from 'next/navigation';

import { getAllUnits, getCourseById } from '@/server/queries/admin-queries';

import { CourseForm } from '@/components/admin/course-form';

export default async function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const [course, units] = await Promise.all([getCourseById(courseId), getAllUnits()]);
  if (!course) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Course</h1>
      <CourseForm
        initialData={{
          id: course.id,
          unitId: course.unitId,
          title: course.title,
          description: course.description ?? '',
          displayOrder: course.displayOrder,
          isPublished: course.isPublished ?? false,
        }}
        units={units.map(u => ({ id: u.id, title: u.title, level: u.level }))}
      />
    </div>
  );
}
