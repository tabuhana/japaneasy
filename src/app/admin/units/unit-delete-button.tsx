'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteUnitAction } from '@/server/actions/admin-actions';

import { DeleteDialog } from '@/components/admin/delete-dialog';

export function UnitDeleteButton({ unitId, unitTitle }: { unitId: string; unitTitle: string }) {
  const router = useRouter();

  return (
    <DeleteDialog
      title="Delete Unit"
      description={`Are you sure you want to delete "${unitTitle}"? This will also delete all courses and words in this unit.`}
      onConfirm={async () => {
        const result = await deleteUnitAction(unitId);
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
