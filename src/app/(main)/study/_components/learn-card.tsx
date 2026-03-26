import Link from 'next/link';

import { Button } from '@/components/ui/button';

type Props = {
  newCardsAvailable: number | null;
};

export const LearnCard = ({ newCardsAvailable }: Props) => {
  if (!newCardsAvailable || newCardsAvailable === 0) {
    return (
      <div className='bg-secondary/20 font-baloo flex flex-col gap-4 rounded-sm p-8'>
        <div className='flex h-full flex-col items-center justify-center'>
          <h2 className='text-2xl font-bold'>No new words available</h2>
          <p className='text-muted-foreground'>Come back later to learn new words.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-secondary/20 font-baloo flex flex-col gap-4 rounded-sm p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Learn New Words</h2>
          <p className='text-muted-foreground'>It&apos;s time to add some new words!</p>
        </div>
        <span className='text-4xl font-bold'>{newCardsAvailable}</span>
      </div>
      <Button
        variant='secondary'
        asChild
      >
        <Link href='/study/learn'>Start Learning</Link>
      </Button>
    </div>
  );
};
