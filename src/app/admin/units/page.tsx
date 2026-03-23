import Link from 'next/link';

import { getAllUnits } from '@/server/queries/admin-queries';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { UnitDeleteButton } from './unit-delete-button';

export default async function AdminUnitsPage() {
  const units = await getAllUnits();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Units</h1>
        <Link href="/admin/units/new">
          <Button>Create Unit</Button>
        </Link>
      </div>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Order</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Level</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Words</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No units found.
                </td>
              </tr>
            ) : (
              units.map(unit => (
                <tr key={unit.id} className="border-b">
                  <td className="px-4 py-3 text-sm">{unit.displayOrder}</td>
                  <td className="px-4 py-3 text-sm font-medium">{unit.level}</td>
                  <td className="px-4 py-3 text-sm">{unit.title}</td>
                  <td className="px-4 py-3 text-sm">{unit.totalWords ?? 0}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={unit.isPublished ? 'default' : 'secondary'}>
                      {unit.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/units/${unit.id}/edit`}>
                        <Button variant="default" size="sm">Edit</Button>
                      </Link>
                      <UnitDeleteButton unitId={unit.id} unitTitle={unit.title} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
