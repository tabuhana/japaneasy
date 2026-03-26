'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';

type KanaQuiz = {
  totalCharacters: number;
  correctAnswers: number;
  completed: boolean;
  bestScore: number | null;
  lastAttempt: string | null;
};

type KanaQuizCardProps = {
  title: string;
  description: string;
  character: string;
  quiz: KanaQuiz;
  href: string;
};

export const KatakanaCard = ({ title, description, character, quiz, href }: KanaQuizCardProps) => {
  const percentage = Math.round((quiz.correctAnswers / quiz.totalCharacters) * 100);
  const isNotStarted = quiz.lastAttempt === null;
  const isInProgress = !isNotStarted && !quiz.completed;

  const statusLabel = quiz.completed ? 'Mastered' : isInProgress ? 'In Progress' : 'Not Started';

  const statusClasses = quiz.completed
    ? 'bg-[#E8F5E4] text-[#5BA550]'
    : isInProgress
      ? 'bg-[#FFF0E5] text-[#E8864A]'
      : 'bg-[#F5EBE0] text-[#7A6050]';

  const neededPercent = 100 - percentage;

  const lastAttemptFormatted = quiz.lastAttempt
    ? new Date(quiz.lastAttempt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className='flex flex-col gap-4 rounded-xl border border-[#E8CDB5] bg-white p-6'>
      {/* Character + info */}
      <div className='flex items-center gap-4'>
        <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#FFF0E5] text-3xl font-bold'>
          {character}
        </div>
        <div>
          <h3 className='font-baloo text-lg font-bold text-[#5C3D2E]'>{title}</h3>
          <p className='text-sm text-[#7A6050]'>{description}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className='space-y-1.5'>
        <div className='flex items-center justify-between text-sm'>
          <span className='font-medium text-[#5C3D2E]'>
            {quiz.correctAnswers} / {quiz.totalCharacters} characters
          </span>
          <span className='font-semibold text-[#E8864A]'>{percentage}%</span>
        </div>
        <div className='h-2.5 w-full overflow-hidden rounded-full bg-[#F5EBE0]'>
          <div
            className='h-full rounded-full bg-[#E8864A] transition-all duration-500'
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Score & last attempt */}
      {(quiz.bestScore !== null || lastAttemptFormatted) && (
        <div className='flex items-center gap-4 text-xs text-[#B8956A]'>
          {quiz.bestScore !== null && <span>Best score: {quiz.bestScore}%</span>}
          {lastAttemptFormatted && <span>Last attempt: {lastAttemptFormatted}</span>}
        </div>
      )}

      {/* CTA */}
      <div className='mt-auto space-y-2'>
        <Link
          href={href}
          className={cn(
            'flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold tracking-wide uppercase transition-all duration-200',
            quiz.completed
              ? 'border-2 border-[#5BA550] text-[#5BA550] hover:bg-[#E8F5E4]'
              : 'bg-[#E8864A] text-white shadow-[0_2px_8px_rgba(232,134,74,0.3)] hover:-translate-y-0.5 hover:bg-[#D35C2B] hover:shadow-[0_4px_12px_rgba(232,134,74,0.4)]'
          )}
        >
          {quiz.completed ? 'Retake Quiz' : isInProgress ? 'Continue Quiz' : 'Take the Quiz'}
        </Link>
        {!quiz.completed && (
          <p className='text-center text-xs text-[#B8956A]'>
            {isInProgress
              ? `Score ${neededPercent}% more to complete`
              : 'Complete the quiz to mark as mastered'}
          </p>
        )}
      </div>
    </div>
  );
};
