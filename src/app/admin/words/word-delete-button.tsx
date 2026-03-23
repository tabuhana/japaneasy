'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteWordAction } from '@/server/actions/admin-actions';

import { DeleteDialog } from '@/components/admin/delete-dialog';

export function WordDeleteButton({ wordId, wordKanji }: { wordId: string; wordKanji: string }) {
  const router = useRouter();

  return (
    <DeleteDialog
      title="Delete Word"
      description={`Are you sure you want to delete "${wordKanji}"?`}
      onConfirm={async () => {
        const result = await deleteWordAction(wordId);
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
