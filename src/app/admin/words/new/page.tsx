import { getAllUnits } from '@/server/queries/admin-queries';

import { WordForm } from '@/components/admin/word-form';

export default async function NewWordPage() {
  const units = await getAllUnits();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Create Word</h1>
      <WordForm units={units.map(u => ({ id: u.id, title: u.title, level: u.level }))} />
    </div>
  );
}
