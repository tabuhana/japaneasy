import { getWordOfTheDay } from '@/lib/word-of-the-day';
import { Button } from '@/components/ui/button';
import { FeedWrapper } from '@/components/layout/feed-wrapper';
import { StickyWrapper } from '@/components/layout/sticky-wrapper';
import { NotificationsCard } from '@/components/notifications-card';
import { ProgressBar } from '@/components/progress-bar';
import { QuickPracticeCard } from '@/components/quick-practice-card';
import { WordOfTheDay } from '@/components/word-of-the-day';

export default async function DashboardScreen() {
  const practices = [
    {
      title: 'Hiragana Quiz',
      description: 'Practice hiragana characters',
      icon: 'あ',
      accentColor: 'bg-accent/30',
      href: '/hiragana',
    },
    {
      title: 'Katakana Quiz',
      description: 'Practice katakana characters',
      icon: 'カ',
      accentColor: 'bg-chart-4/30',
      href: '/katakana',
    },
  ];

  const word = await getWordOfTheDay();

  const progress = [
    {
      label: 'N5',
      value: 25,
    },
    {
      label: 'N4',
      value: 0,
    },
    {
      label: 'N3',
      value: 0,
    },
    {
      label: 'N2',
      value: 0,
    },
    {
      label: 'N1',
      value: 0,
    },
  ];

  return (
    <div className='flex flex-row-reverse gap-12 px-6'>
      <StickyWrapper>
        <div className='space-y-3'>
          <h2 className='font-baloo text-2xl font-bold'>Your Progress</h2>
          <div className='border-border bg-card rounded-sm border-2 p-4'>
            <div className='flex flex-col gap-2'>
              {progress.map(item => (
                <ProgressBar
                  key={item.label}
                  {...item}
                />
              ))}
            </div>
          </div>
        </div>
        <div className='space-y-3'>
          <h2 className='font-baloo text-2xl font-bold'>Quick Practice</h2>
          {practices.map(practice => (
            <QuickPracticeCard
              key={practice.title}
              {...practice}
            />
          ))}
        </div>
      </StickyWrapper>
      <FeedWrapper>
        <div className='flex flex-col gap-4'>
          <NotificationsCard />
          {word && <WordOfTheDay word={word} />}
          <section className='space-y-3'>
            <div className='font-baloo flex items-center justify-between font-bold'>
              <h2 className='text-2xl'>Courses</h2>
            </div>

            <div className='bg-card font-baloo text-muted-foreground flex items-center justify-center gap-2 rounded-sm border-2 border-dashed py-16 font-semibold'>
              <Button
                variant='ghost'
                className='flex cursor-pointer flex-col gap-2 p-8'
              >
                <p>You don't have any courses yet...</p>
                <p className='text-muted-foreground/50 text-xs'>コースがまだありません</p>
              </Button>
            </div>
          </section>
        </div>
      </FeedWrapper>
    </div>
  );
}
