'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { submitReview } from '@/server/actions';
import { findUserWordsDue } from '@/server/queries';

type Cards = Awaited<ReturnType<typeof findUserWordsDue>>;

interface StudySessionProps {
  cards: Cards;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function StudySession({ cards }: StudySessionProps) {
  const router = useRouter();
  const [sessionCards] = useState(() => cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });

  const [optionsPerCard, setOptionsPerCard] = useState<string[][]>(() =>
    sessionCards.map(card => [card.word.english ?? ''])
  );

  useEffect(() => {
    setOptionsPerCard(
      sessionCards.map((card, idx) => {
        const correctAnswer = card.word.english ?? '';
        const wrongPool = sessionCards
          .filter((_, i) => i !== idx)
          .map(c => c.word.english ?? '')
          .filter(e => e !== correctAnswer);
        const wrongOptions = shuffleArray(wrongPool).slice(0, 3);
        return shuffleArray([correctAnswer, ...wrongOptions]);
      })
    );
  }, [sessionCards]);

  const card = sessionCards[currentIndex];
  const options = optionsPerCard[currentIndex];
  const correctAnswer = card.word.english ?? '';
  const isCorrect = selectedAnswer === correctAnswer;
  const progress = ((currentIndex + 1) / sessionCards.length) * 100;
  const isLastCard = currentIndex === sessionCards.length - 1;

  const handleSelectAnswer = async (answer: string) => {
    if (showResult || isSubmitting) return;

    setSelectedAnswer(answer);
    setShowResult(true);
    setIsSubmitting(true);

    const wasCorrect = answer === correctAnswer;
    setScore(prev => ({
      correct: prev.correct + (wasCorrect ? 1 : 0),
      incorrect: prev.incorrect + (wasCorrect ? 0 : 1),
    }));

    await submitReview(card.userWord.id, wasCorrect);
    setIsSubmitting(false);
  };

  const handleNext = () => {
    if (isLastCard) {
      setIsComplete(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  if (isComplete) {
    const total = score.correct + score.incorrect;
    const percentage = total > 0 ? Math.round((score.correct / total) * 100) : 0;

    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center text-center duration-300">
          <p className="text-muted-foreground mb-2 text-sm">Session complete</p>
          <p className="text-foreground mb-6 text-4xl font-bold">{percentage}%</p>
          <div className="text-muted-foreground mb-8 flex gap-6 text-sm">
            <span className="text-green-600">{score.correct} correct</span>
            <span className="text-red-500">{score.incorrect} incorrect</span>
          </div>
          <Button onClick={() => router.push('/')} className="px-8 py-6 text-base font-semibold">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col px-4 py-6">
      <div className="mx-auto w-full max-w-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-muted-foreground text-sm font-medium">
            {currentIndex + 1} / {sessionCards.length}
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
            <p className="text-muted-foreground mb-4 text-sm">What does this mean?</p>
            <div className="border-primary/30 inline-block rounded-2xl border-2 border-dashed p-6">
              <span className="text-foreground text-8xl">
                {card.word.kanji ?? card.word.kana}
              </span>
            </div>
          </div>

          {card.word.kanji && (
            <p className="text-primary mb-8 text-2xl">{card.word.kana}</p>
          )}

          {/* Options */}
          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            {options.map(option => {
              let buttonClass =
                'bg-card border-2 border-primary/40 hover:border-primary hover:bg-accent text-foreground shadow-sm hover:shadow-md';

              if (showResult) {
                if (option === correctAnswer) {
                  buttonClass =
                    'bg-green-50 border-3 border-green-500 text-green-700 shadow-md dark:bg-green-950 dark:text-green-300';
                } else if (option === selectedAnswer && !isCorrect) {
                  buttonClass =
                    'bg-red-50 border-3 border-red-400 text-red-600 dark:bg-red-950 dark:text-red-300';
                } else {
                  buttonClass =
                    'bg-card border-2 border-muted text-muted-foreground opacity-50';
                }
              }

              return (
                <Button
                  key={option}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={showResult}
                  className={cn(
                    'h-14 rounded-2xl text-base font-medium transition-all hover:scale-105 active:scale-95',
                    buttonClass
                  )}
                >
                  {option}
                </Button>
              );
            })}
          </div>

          {/* Feedback + Next */}
          {showResult && (
            <div className="animate-in fade-in slide-in-from-bottom-4 mt-8 flex flex-col items-center duration-300">
              <p
                className={cn('mb-4 text-2xl', isCorrect ? 'text-green-600' : 'text-red-500')}
              >
                {isCorrect ? 'Correct!' : 'Not quite!'}
              </p>
              {!isCorrect && (
                <p className="text-muted-foreground mb-4 text-sm">
                  The answer was <span className="text-foreground font-medium">{correctAnswer}</span>
                </p>
              )}
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-8 py-6 text-base font-semibold"
              >
                {isLastCard ? 'See Results' : 'Next'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
