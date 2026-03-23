import { getAllCourses, getAllUnits } from '@/server/queries/admin-queries';

import { LessonForm } from '@/components/admin/lesson-form';

export default async function NewLessonPage() {
  const [courses, units] = await Promise.all([getAllCourses(), getAllUnits()]);
  const unitMap = new Map(units.map(u => [u.id, u]));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Create Lesson</h1>
      <LessonForm
        courses={courses.map(c => ({
          id: c.id,
          title: c.title,
          unitLevel: unitMap.get(c.unitId)?.level ?? '—',
        }))}
      />
    </div>
  );
}
