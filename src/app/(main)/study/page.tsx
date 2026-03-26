import Link from 'next/link';

import { getUserReviewsDue } from '@/drizzle/queries';

import { KanjiUpgradesCard } from './_components/kanji-upgrades-card';
import { KatakanaCard } from './_components/katakana-card';
import { LearnCard } from './_components/learn-card';
import { ReviewCard } from './_components/review-card';

const newCardsAvailable = 15;

const hiraganaQuiz = {
  totalCharacters: 46,
  correctAnswers: 32,
  completed: false,
  bestScore: 78,
  lastAttempt: '2026-03-22T14:00:00Z',
};

const katakanaQuiz = {
  totalCharacters: 46,
  correctAnswers: 0,
  completed: false,
  bestScore: null as number | null,
  lastAttempt: null as string | null,
};

export default async function StudyPage() {
  const reviewsDueCount = await getUserReviewsDue();

  return (
    <div className='px-6 pb-10'>
      <div className='space-y-3'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <ReviewCard reviewsDueCount={reviewsDueCount} />

          <LearnCard newCardsAvailable={newCardsAvailable} />
        </div>

        <KanjiUpgradesCard />

        <div>
          <div className='mb-4'>
            <h2 className='font-baloo text-2xl font-bold text-[#5C3D2E]'>Kana Mastery</h2>
            <p className='text-sm text-[#7A6050]'>
              Complete both quizzes to prove your kana knowledge — practice mode doesn&apos;t count
            </p>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <KatakanaCard
              title='Hiragana'
              description='Master the basic Japanese alphabet'
              character='あ'
              quiz={hiraganaQuiz}
              href='/study/hiragana-quiz'
            />
            <KatakanaCard
              title='Katakana'
              description='Master the secondary Japanese alphabet'
              character='カ'
              quiz={katakanaQuiz}
              href='/study/katakana-quiz'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
