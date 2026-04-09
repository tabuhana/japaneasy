import Link from 'next/link';

import { Button } from '@/components/ui/button';

const upgradeableCards = [
  { id: 1, reading: 'たべる', kanji: '食べる', meaning: 'to eat' },
  { id: 2, reading: 'のむ', kanji: '飲む', meaning: 'to drink' },
  { id: 3, reading: 'はしる', kanji: '走る', meaning: 'to run' },
  { id: 4, reading: 'あたらしい', kanji: '新しい', meaning: 'new' },
  { id: 5, reading: 'おおきい', kanji: '大きい', meaning: 'big' },
  { id: 6, reading: 'がっこう', kanji: '学校', meaning: 'school' },
  { id: 7, reading: 'せんせい', kanji: '先生', meaning: 'teacher' },
];

const visibleUpgrades = upgradeableCards.slice(0, 5);
const remainingCount = upgradeableCards.length - visibleUpgrades.length;

export const KanjiUpgradesCard = () => {
  return (
    <div className='bg-super/20 font-baloo flex flex-col gap-4 rounded-sm px-4 py-8'>
      <div className='mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3'>
          <div>
            <h2 className='text-2xl font-bold'>
              Cards Ready For Upgrade
              <span className='bg-super text-background ml-4 rounded-full px-4 text-xl font-bold'>
                {upgradeableCards.length}
              </span>
            </h2>
            <p className='text-muted-foreground'>
              Upgrading a word will unlock the kanji for that word!
            </p>
          </div>
        </div>
        <Button
          variant='super'
          asChild
        >
          <Link href='#'>Start Upgrades</Link>
        </Button>
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
        {visibleUpgrades.map(card => (
          <div
            key={card.id}
            className='group border-super/30 hover:border-super relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border bg-[#FAF5FF] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'
          >
            <div className='bg-super text-background absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold'>
              ↑
            </div>
            <span className='text-sm font-bold'>{card.reading}</span>
            <span className='text-super text-2xl'>→ {card.kanji}</span>
            <span className='text-xs text-[#B8956A]'>{card.meaning}</span>
          </div>
        ))}
      </div>

      {remainingCount > 0 && (
        <p className='text-muted-foreground mt-4 text-center text-sm'>
          +{remainingCount} more upgradeable cards
        </p>
      )}
    </div>
  );
};
