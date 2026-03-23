import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { FeedWrapper } from '@/components/layout/feed-wrapper';
import { StickyWrapper } from '@/components/layout/sticky-wrapper';
import { Card, CardContent } from '@/components/ui/card';

export default async function DashboardScreen() {

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

          <Link href='/hiragana'>
            <Card className='border-primary/30 hover:border-primary cursor-pointer rounded-2xl border-2 shadow-md transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'>
              <CardContent className='flex items-center justify-between p-4'>
                <div className='flex items-center gap-4'>
                  <div className='bg-secondary flex h-14 w-14 items-center justify-center rounded-2xl'>
                    <span className='text-secondary-foreground text-2xl'>あ</span>
                  </div>
                  <div>
                    <p className='text-foreground font-semibold'>Hiragana Practice</p>
                    <p className='text-muted-foreground text-sm'>Practice hiragana characters</p>
                  </div>
                </div>
                <ChevronRight className='text-primary h-5 w-5' />
              </CardContent>
            </Card>
          </Link>

          <Link href='/katakana'>
            <Card className='border-primary/30 hover:border-primary cursor-pointer rounded-2xl border-2 shadow-md transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'>
              <CardContent className='flex items-center justify-between p-4'>
                <div className='flex items-center gap-4'>
                  <div className='bg-secondary flex h-14 w-14 items-center justify-center rounded-2xl'>
                    <span className='text-secondary-foreground text-2xl'>カ</span>
                  </div>
                  <div>
                    <p className='text-foreground font-semibold'>Katakana Practice</p>
                    <p className='text-muted-foreground text-sm'>Practice katakana characters</p>
                  </div>
                </div>
                <ChevronRight className='text-primary h-5 w-5' />
              </CardContent>
            </Card>
          </Link>
        </div>
      </StickyWrapper>
      <FeedWrapper>
        <div className='flex flex-col gap-4'>
          {/* {unitProgress &&
            unitProgress.map(unit => (
              <UnitCard
                key={unit.unitId}
                unit={unit}
              />
            ))} */}

            content
        </div>
      </FeedWrapper>
    </div>
  );
}
