import { notFound } from 'next/navigation';

import { getAdminWordById, getAllUnits } from '@/server/queries/admin-queries';

import { WordForm } from '@/components/admin/word-form';

export default async function EditWordPage({ params }: { params: Promise<{ wordId: string }> }) {
  const { wordId } = await params;
  const [word, units] = await Promise.all([getAdminWordById(wordId), getAllUnits()]);
  if (!word) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Word</h1>
      <WordForm
        initialData={{
          id: word.id,
          unitId: word.unitId,
          kanji: word.kanji ?? '',
          kana: word.kana ?? '',
          romaji: word.romaji ?? '',
          english: word.english ?? '',
          partOfSpeech: word.partOfSpeech ?? '',
          wordGroup: word.wordGroup ?? undefined,
          displayOrder: word.displayOrder,
        }}
        units={units.map(u => ({ id: u.id, title: u.title, level: u.level }))}
      />
    </div>
  );
}
