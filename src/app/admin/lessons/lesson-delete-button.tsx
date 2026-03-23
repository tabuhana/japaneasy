'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteLessonAction } from '@/server/actions/admin-actions';

import { DeleteDialog } from '@/components/admin/delete-dialog';

export function LessonDeleteButton({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  const router = useRouter();

  return (
    <DeleteDialog
      title="Delete Lesson"
      description={`Are you sure you want to delete "${lessonTitle}"?`}
      onConfirm={async () => {
        const result = await deleteLessonAction(lessonId);
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
