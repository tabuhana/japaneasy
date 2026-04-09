import Link from 'next/link';
import { getAllUnits, getPaginatedWords } from '@/server/queries/admin-queries';

import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/admin/pagination';

import { WordDeleteButton } from './word-delete-button';
import { WordFilter } from './word-filter';

const PAGE_SIZE = 20;

export default async function AdminWordsPage({
  searchParams,
}: {
  searchParams: Promise<{ unitId?: string; page?: string }>;
}) {
  const { unitId, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [result, units] = await Promise.all([
    getPaginatedWords(page, PAGE_SIZE, unitId),
    getAllUnits(),
  ]);

  const unitMap = new Map(units.map(u => [u.id, u]));

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Words</h1>
        <Link href='/admin/words/new'>
          <Button>Create Word</Button>
        </Link>
      </div>
      <div className='mb-4'>
        <WordFilter
          units={units}
          currentUnitId={unitId}
        />
      </div>
      <div className='rounded-md border'>
        <table className='w-full'>
          <thead>
            <tr className='bg-muted/50 border-b'>
              <th className='px-4 py-3 text-left text-sm font-medium'>Order</th>
              <th className='px-4 py-3 text-left text-sm font-medium'>Unit</th>
              <th className='px-4 py-3 text-left text-sm font-medium'>Kanji</th>
              <th className='px-4 py-3 text-left text-sm font-medium'>Kana</th>
              <th className='px-4 py-3 text-left text-sm font-medium'>Romaji</th>
              <th className='px-4 py-3 text-left text-sm font-medium'>English</th>
              <th className='px-4 py-3 text-left text-sm font-medium'>Group</th>
              <th className='px-4 py-3 text-right text-sm font-medium'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className='text-muted-foreground px-4 py-8 text-center'
                >
                  No words found.
                </td>
              </tr>
            ) : (
              result.items.map(word => {
                const unit = unitMap.get(word.unitId);
                return (
                  <tr
                    key={word.id}
                    className='border-b'
                  >
                    <td className='px-4 py-3 text-sm'>{word.displayOrder}</td>
                    <td className='px-4 py-3 text-sm'>{unit ? unit.level : '—'}</td>
                    <td className='px-4 py-3 text-sm font-medium'>{word.kanji ?? '—'}</td>
                    <td className='px-4 py-3 text-sm'>{word.kana ?? '—'}</td>
                    <td className='px-4 py-3 text-sm'>{word.romaji ?? '—'}</td>
                    <td className='px-4 py-3 text-sm'>{word.english ?? '—'}</td>
                    <td className='px-4 py-3 text-sm'>{word.wordGroup ?? '—'}</td>
                    <td className='px-4 py-3 text-right'>
                      <div className='flex justify-end gap-2'>
                        <Link href={`/admin/words/${word.id}/edit`}>
                          <Button
                            variant='default'
                            size='sm'
                          >
                            Edit
                          </Button>
                        </Link>
                        <WordDeleteButton
                          wordId={word.id}
                          wordKanji={word.kanji ?? word.kana ?? 'word'}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {result.totalPages > 1 && (
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          pageSize={result.pageSize}
        />
      )}
    </div>
  );
}
