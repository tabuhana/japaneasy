import Link from 'next/link';

import { Button } from '@/components/ui/button';

const learnPreviewCards = [
  { id: 1, reading: 'ねこ', kanji: '猫', meaning: 'cat' },
  { id: 2, reading: 'いぬ', kanji: '犬', meaning: 'dog' },
  { id: 3, reading: 'ほん', kanji: '本', meaning: 'book' },
  { id: 4, reading: 'えき', kanji: '駅', meaning: 'station' },
  { id: 5, reading: 'でんしゃ', kanji: '電車', meaning: 'train' },
];

type Props = {
  newCardsAvailable: number | null;
};

export const LearnCard = ({ newCardsAvailable }: Props) => {
  const visibleCards = learnPreviewCards.slice(0, 5);
  const remainingCount = Math.max(newCardsAvailable - visibleCards.length, 0);

  if (!newCardsAvailable || newCardsAvailable === 0) {
    return (
      <div className='bg-secondary/20 font-baloo flex flex-col gap-4 rounded-sm px-4 py-8'>
        <div className='flex h-full flex-col items-center justify-center'>
          <h2 className='text-2xl font-bold'>No new words available</h2>
          <p className='text-muted-foreground'>Come back later to learn new words.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-secondary/20 font-baloo flex flex-col gap-4 rounded-sm px-4 py-8'>
      <div className='mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>
            Learn New Words
            <span className='bg-secondary text-background ml-4 rounded-full px-4 text-xl font-bold'>
              {newCardsAvailable}
            </span>
          </h2>
          <p className='text-muted-foreground'>It&apos;s time to add some new words!</p>
        </div>
        <Button
          variant='secondary'
          asChild
        >
          <Link href='/study/learn'>Start Learning</Link>
        </Button>
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
        {visibleCards.map(card => (
          <div
            key={card.id}
            className='group border-secondary/30 hover:border-secondary relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border bg-[#ECFDF5] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'
          >
            <div className='bg-secondary text-background absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold'>
              +
            </div>
            <span className='text-sm font-bold'>{card.reading}</span>
            <span className='text-secondary text-2xl'>{card.kanji}</span>
            <span className='text-xs text-[#B8956A]'>{card.meaning}</span>
          </div>
        ))}
      </div>

      {remainingCount > 0 && (
        <p className='text-muted-foreground mt-4 text-center text-sm'>
          +{remainingCount} more cards ready to learn
        </p>
      )}
    </div>
  );
};
