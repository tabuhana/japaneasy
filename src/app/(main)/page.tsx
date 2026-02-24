'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, Trophy } from 'lucide-react';

import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FeedWrapper } from '@/components/layout/feed-wrapper';
import { StickyWrapper } from '@/components/layout/sticky-wrapper';

export default function DashboardScreen() {
  const router = useRouter();

  const currentLevel = 'N5';
  const progressPercent = 65;
  const proficiencyPoints = 1250;
  const streakDays = 7;
  const wordsLearned = 127;

  const handleSignout = () => {
    signOut();
    router.push('/auth/signin');
  };

  return (
    <>
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
          <Button onClick={handleSignout}>Logout</Button>
        </StickyWrapper>
        <FeedWrapper>
          <Card className='border-primary/60 bg-card/95 overflow-hidden rounded-3xl border-3 shadow-lg backdrop-blur-sm'>
            <CardContent className='p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <div>
                  <p className='text-muted-foreground text-sm'>Current Level</p>
                  <div className='mt-1 flex items-center gap-2'>
                    <span className='text-primary text-4xl font-(--font-cherry-bomb)'>
                      {currentLevel}
                    </span>
                    <span className='text-primary bg-primary/15 rounded-full px-3 py-1 text-sm font-medium'>
                      Beginner
                    </span>
                  </div>
                </div>
                <div className='bg-primary/10 border-primary/40 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed'>
                  <Trophy className='text-primary h-8 w-8' />
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Progress to N4</span>
                  <span className='text-primary font-semibold'>{progressPercent}%</span>
                </div>
                <Progress
                  value={progressPercent}
                  className='h-3 rounded-full'
                />
              </div>
            </CardContent>
          </Card>
        </FeedWrapper>
      </div>
    </>
  );
}
