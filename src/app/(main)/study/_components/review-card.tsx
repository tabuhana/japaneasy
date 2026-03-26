'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

type Props = {
  reviewsDueCount: number | null;
};

export const ReviewCard = ({ reviewsDueCount }: Props) => {
  if (!reviewsDueCount || reviewsDueCount === 0) {
    return (
      <div className='bg-primary/20 font-baloo flex flex-col gap-4 rounded-sm p-8'>
        <div className='flex h-full flex-col items-center justify-center'>
          <h2 className='text-2xl font-bold'>No words due for review</h2>
          <p className='text-muted-foreground'>Come back later to review your words.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-primary/20 font-baloo flex flex-col gap-4 rounded-sm p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Review Your Words</h2>
          <p className='text-muted-foreground'>It&apos;s time to review your words!</p>
        </div>
        <span className='text-4xl font-bold'>{reviewsDueCount}</span>
      </div>
      <Button
        variant='primary'
        asChild
      >
        <Link href='/study/review'>Start Reviewing</Link>
      </Button>
    </div>
  );
};
