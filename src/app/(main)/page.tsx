import { getAllLevelProgress } from '@/server/actions';
import { ChevronRight } from 'lucide-react';

import { FeedWrapper } from '@/components/layout/feed-wrapper';
import { StickyWrapper } from '@/components/layout/sticky-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { UnitCard } from '@/components/unit-card';
import { getUserWordsByLevel } from '@/server/queries';

const LEVEL_LABELS: Record<string, string> = {
  N5: 'Japanese Basics',
  N4: 'Elementary Japanese',
  N3: 'Intermediate Japanese',
  N2: 'Upper Intermediate',
  N1: 'Advanced Japanese',
};

export default async function DashboardScreen() {

  const levelProgressRes = await getAllLevelProgress();
  const levels = levelProgressRes.data?.levels ?? [];

  const userWords = await getUserWordsByLevel('N5');
  console.log('userWords', userWords);


  return (
    <div className='flex flex-row-reverse gap-[48px] px-6'>
      <StickyWrapper>
        <div className='space-y-3'>
          <Card className='border-primary/50 hover:border-primary cursor-pointer rounded-2xl border-2 shadow-md transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'>
            <CardContent className='flex items-center justify-between p-4'>
              <div className='flex items-center gap-4'>
                <div className='bg-primary flex h-14 w-14 items-center justify-center rounded-2xl shadow-md'>
                  <span className='text-primary-foreground text-2xl'>漢</span>
                </div>
                <div>
                  <p className='text-foreground font-semibold'>Kanji Basics</p>
                  <p className='text-muted-foreground text-sm'>12 cards remaining</p>
                </div>
              </div>
              <ChevronRight className='text-primary h-5 w-5' />
            </CardContent>
          </Card>

          <Card className='border-primary/30 cursor-pointer rounded-2xl border-2 opacity-70 shadow-md transition-all hover:shadow-lg'>
            <CardContent className='flex items-center justify-between p-4'>
              <div className='flex items-center gap-4'>
                <div className='bg-secondary flex h-14 w-14 items-center justify-center rounded-2xl'>
                  <span className='text-secondary-foreground text-2xl'>あ</span>
                </div>
                <div>
                  <p className='text-foreground font-semibold'>Hiragana Practice</p>
                  <p className='text-muted-foreground text-sm'>Completed today ✓</p>
                </div>
              </div>
              <ChevronRight className='text-muted-foreground h-5 w-5' />
            </CardContent>
          </Card>
        </div>
      </StickyWrapper>
      <FeedWrapper>
        <div className='flex flex-col gap-4'>
          {levels.map(level => {
            return (
              <UnitCard
                key={level.level}
                title={LEVEL_LABELS[level.level] ?? level.level}
                description='Level Progress'
                unitProgress={level.wordsMasteredCount / level.totalWordsInLevel}
                ctaLabel='Continue'
                progressItems={level.groups.map(group => ({
                  label: `Group ${group.group}`,
                  value: group.wordsCompleted / group.totalWords,
                }))}
                className='bg-primary'
              />
            );
          })}
        </div>
      </FeedWrapper>
    </div>
  );
}
