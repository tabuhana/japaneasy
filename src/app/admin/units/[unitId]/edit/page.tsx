import { notFound } from 'next/navigation';

import { getUnitById } from '@/server/queries/admin-queries';

import { UnitForm } from '@/components/admin/unit-form';

export default async function EditUnitPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const unit = await getUnitById(unitId);
  if (!unit) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Unit</h1>
      <UnitForm
        initialData={{
          id: unit.id,
          level: unit.level,
          title: unit.title,
          description: unit.description ?? '',
          displayOrder: unit.displayOrder,
          totalWords: unit.totalWords ?? 0,
          isPublished: unit.isPublished ?? false,
          color: unit.color ?? '',
        }}
      />
    </div>
  );
}
