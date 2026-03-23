import Link from 'next/link';

import { getAllCourses, getAllUnits } from '@/server/queries/admin-queries';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { CourseDeleteButton } from './course-delete-button';
import { CourseFilter } from './course-filter';

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ unitId?: string }>;
}) {
  const { unitId } = await searchParams;
  const [courses, units] = await Promise.all([getAllCourses(unitId), getAllUnits()]);

  const unitMap = new Map(units.map(u => [u.id, u]));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Link href="/admin/courses/new">
          <Button>Create Course</Button>
        </Link>
      </div>
      <div className="mb-4">
        <CourseFilter units={units} currentUnitId={unitId} />
      </div>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Order</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Unit</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No courses found.
                </td>
              </tr>
            ) : (
              courses.map(course => {
                const unit = unitMap.get(course.unitId);
                return (
                  <tr key={course.id} className="border-b">
                    <td className="px-4 py-3 text-sm">{course.displayOrder}</td>
                    <td className="px-4 py-3 text-sm">{unit ? `${unit.level} — ${unit.title}` : '—'}</td>
                    <td className="px-4 py-3 text-sm">{course.title}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/courses/${course.id}/edit`}>
                          <Button variant="default" size="sm">Edit</Button>
                        </Link>
                        <CourseDeleteButton courseId={course.id} courseTitle={course.title} />
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
