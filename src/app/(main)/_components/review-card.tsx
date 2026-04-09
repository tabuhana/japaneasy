'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

const reviewPreviewCards = [
  { id: 1, reading: 'みず', kanji: '水', meaning: 'water' },
  { id: 2, reading: 'やま', kanji: '山', meaning: 'mountain' },
  { id: 3, reading: 'くるま', kanji: '車', meaning: 'car' },
  { id: 4, reading: 'ともだち', kanji: '友達', meaning: 'friend' },
  { id: 5, reading: 'あさ', kanji: '朝', meaning: 'morning' },
];

type Props = {
  reviewsDueCount: number | null;
};

export const ReviewCard = ({ reviewsDueCount }: Props) => {
  const visibleReviews = reviewPreviewCards.slice(0, 5);
  const remainingCount = Math.max(reviewsDueCount - visibleReviews.length, 0);

  if (!reviewsDueCount || reviewsDueCount === 0) {
    return (
      <div className='bg-primary/20 font-baloo flex flex-col gap-4 rounded-sm px-4 py-8'>
        <div className='flex h-full flex-col items-center justify-center'>
          <h2 className='text-2xl font-bold'>No words due for review</h2>
          <p className='text-muted-foreground'>Come back later to review your words.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-primary/20 font-baloo flex flex-col gap-4 rounded-sm px-4 py-8'>
      <div className='mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>
            Review Your Words
            <span className='bg-primary text-background ml-4 rounded-full px-4 text-xl font-bold'>
              {reviewsDueCount}
            </span>
          </h2>
          <p className='text-muted-foreground'>It&apos;s time to review your words!</p>
        </div>
        <Button
          variant='primary'
          asChild
        >
          <Link href='/study/review'>Start Reviewing</Link>
        </Button>
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
        {visibleReviews.map(card => (
          <div
            key={card.id}
            className='group border-primary/30 hover:border-primary relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border bg-[#FFF3EC] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'
          >
            <div className='bg-primary text-background absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold'>
              !
            </div>
            <span className='text-sm font-bold'>{card.reading}</span>
            <span className='text-primary text-2xl'>{card.kanji}</span>
            <span className='text-xs text-[#B8956A]'>{card.meaning}</span>
          </div>
        ))}
      </div>

      {remainingCount > 0 && (
        <p className='text-muted-foreground mt-4 text-center text-sm'>
          +{remainingCount} more cards ready to review
        </p>
      )}
    </div>
  );
};
