'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { toRomaji } from 'wanakana';

import type { HiraganaChar } from '@/lib/hiragana-data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PracticeSessionProps {
  characters: HiraganaChar[];
  onComplete: () => void;
}

export default function PracticeSession({ characters, onComplete }: PracticeSessionProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, boolean | null>>({});
  const [completed, setCompleted] = useState(false);

  const checkAnswer = (answer: string, char: HiraganaChar): boolean => {
    const normalized = answer.trim().toLowerCase();
    if (normalized === char.romaji.toLowerCase()) return true;
    if (char.alternates.some(alt => alt.toLowerCase() === normalized)) return true;
    if (toRomaji(char.kana).toLowerCase() === normalized) return true;
    return false;
  };

  const handleBlur = (index: number) => {
    const value = (answers[index] ?? '').trim();
    if (!value) return;

    const correct = checkAnswer(value, characters[index]);
    setResults(prev => ({ ...prev, [index]: correct }));
  };

  const handleChange = (index: number, value: string) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
    // Clear previous result when user edits, so it re-validates on next blur
    if (results[index] != null) {
      setResults(prev => ({ ...prev, [index]: null }));
    }
  };

  const answered = Object.values(results).filter(r => r != null).length;
  const correct = Object.values(results).filter(r => r === true).length;
  const incorrect = Object.values(results).filter(r => r === false).length;
  const total = characters.length;
  const allAnswered = answered === total;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className='flex min-h-[calc(100vh-4rem)] flex-col px-4 py-6'>
      <div className='mx-auto w-full max-w-3xl'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <p className='text-muted-foreground text-sm font-medium'>
            Type the romaji for each character
          </p>
          <button
            onClick={onComplete}
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Score summary */}
        <div className='text-muted-foreground mb-6 flex gap-4 text-sm'>
          <span>
            {answered} / {total} answered
          </span>
          <span className='text-green-600'>{correct} correct</span>
          <span className='text-red-500'>{incorrect} incorrect</span>
        </div>

        {/* Grid */}
        <div className='grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5'>
          {characters.map((char, index) => {
            const result = results[index];
            const isAnswered = result != null;

            return (
              <div
                key={index}
                className={cn(
                  'flex flex-col items-center rounded-xl border-2 p-3 transition-colors',
                  result === true && 'border-green-500 bg-green-500/10',
                  result === false && 'border-red-500 bg-red-500/10',
                  result == null && 'border-border'
                )}
              >
                <span className='text-foreground mb-2 text-4xl'>{char.kana}</span>
                <Input
                  value={answers[index] ?? ''}
                  onChange={e => handleChange(index, e.target.value)}
                  onBlur={() => handleBlur(index)}
                  disabled={result === true || completed}
                  placeholder='...'
                  autoComplete='off'
                  className='h-8 text-center text-sm'
                />
              </div>
            );
          })}
        </div>

        {/* Complete button */}
        {allAnswered && correct === total && !completed && (
          <div className='animate-in fade-in mt-8 flex justify-center duration-300'>
            <Button
              onClick={() => setCompleted(true)}
              className='px-8 py-6 text-base font-semibold'
            >
              Complete
            </Button>
          </div>
        )}

        {/* Results section */}
        {completed && (
          <div className='animate-in fade-in slide-in-from-bottom-4 mt-8 flex flex-col items-center text-center duration-300'>
            <p className='text-muted-foreground mb-2 text-sm'>Session complete</p>
            <p className='text-foreground mb-6 text-4xl font-bold'>{percentage}%</p>
            <div className='flex gap-3'>
              <Button
                onClick={onComplete}
                variant='default'
                className='px-8 py-6 text-base font-semibold'
              >
                Practice Again
              </Button>
              <Button
                onClick={() => router.push('/')}
                className='px-8 py-6 text-base font-semibold'
              >
                Back to Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
