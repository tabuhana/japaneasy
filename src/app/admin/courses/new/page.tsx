import { getAllUnits } from '@/server/queries/admin-queries';

import { CourseForm } from '@/components/admin/course-form';

export default async function NewCoursePage() {
  const units = await getAllUnits();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Create Course</h1>
      <CourseForm units={units.map(u => ({ id: u.id, title: u.title, level: u.level }))} />
    </div>
  );
}
