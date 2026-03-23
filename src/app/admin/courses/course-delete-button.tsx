'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteCourseAction } from '@/server/actions/admin-actions';

import { DeleteDialog } from '@/components/admin/delete-dialog';

export function CourseDeleteButton({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const router = useRouter();

  return (
    <DeleteDialog
      title="Delete Course"
      description={`Are you sure you want to delete "${courseTitle}"?`}
      onConfirm={async () => {
        const result = await deleteCourseAction(courseId);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      }}
    />
  );
}
