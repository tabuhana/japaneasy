'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { completeLearnSession } from '@/server/actions/learn-actions';
import { findNewUserWords } from '@/server/queries/user-word-queries';

type Cards = Awaited<ReturnType<typeof findNewUserWords>>;

interface LearnSessionProps {
  cards: Cards;
}

export default function LearnSession({ cards }: LearnSessionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const card = cards[currentIndex];
  const isLastCard = currentIndex === cards.length - 1;
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleNext = async () => {
    if (isLastCard) {
      setIsSubmitting(true);
      const ids = cards.map(c => c.userWord.id);
      await completeLearnSession(ids);
      router.push('/study');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col px-4 py-6">
      <div className="mx-auto w-full max-w-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-muted-foreground text-sm font-medium">
            {currentIndex + 1} / {cards.length}
          </span>
          <button
            onClick={() => router.push('/')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="mb-12 h-2" />

        {/* Card */}
        <div
          key={currentIndex}
          className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center text-center duration-300"
        >
          <div className="mb-8">
            <p className="text-muted-foreground mb-4 text-sm">New word</p>
            <div className="border-primary/30 inline-block rounded-2xl border-2 border-dashed p-6">
              <span className="text-foreground text-8xl">
                {card.word.kanji ?? card.word.kana}
              </span>
            </div>
          </div>

          {card.word.kanji && (
            <p className="text-primary mb-2 text-2xl">{card.word.kana}</p>
          )}
          <p className="text-muted-foreground mb-4 text-lg">{card.word.romaji}</p>
          <p className="text-foreground text-xl font-semibold">{card.word.english}</p>
        </div>

        {/* Button */}
        <div className="mt-12 flex justify-center">
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-8 py-6 text-base font-semibold"
          >
            {isSubmitting
              ? 'Loading...'
              : isLastCard
                ? 'Start Studying'
                : 'Got it'}
          </Button>
        </div>
      </div>
    </div>
  );
}
