'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { FeedWrapper } from '@/components/layout/feed-wrapper';

// --- Mock Data ---

const reviewsDue = 50;
const newCardsAvailable = 15;

const upgradeableCards = [
  { id: 1, reading: 'たべる', kanji: '食べる', meaning: 'to eat' },
  { id: 2, reading: 'のむ', kanji: '飲む', meaning: 'to drink' },
  { id: 3, reading: 'はしる', kanji: '走る', meaning: 'to run' },
  { id: 4, reading: 'あたらしい', kanji: '新しい', meaning: 'new' },
  { id: 5, reading: 'おおきい', kanji: '大きい', meaning: 'big' },
  { id: 6, reading: 'がっこう', kanji: '学校', meaning: 'school' },
  { id: 7, reading: 'せんせい', kanji: '先生', meaning: 'teacher' },
];

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

// --- Types ---

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

// --- KanaQuizCard Component ---

function KanaQuizCard({ title, description, character, quiz, href }: KanaQuizCardProps) {
  const percentage = Math.round((quiz.correctAnswers / quiz.totalCharacters) * 100);
  const isNotStarted = quiz.lastAttempt === null;
  const isInProgress = !isNotStarted && !quiz.completed;

  const statusLabel = quiz.completed
    ? 'Mastered'
    : isInProgress
      ? 'In Progress'
      : 'Not Started';

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
    <div className="relative flex flex-col gap-4 rounded-xl border border-[#E8CDB5] bg-white p-6">
      {/* Status badge */}
      <div className="absolute right-4 top-4">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
            statusClasses
          )}
        >
          {quiz.completed && <CheckCircle className="h-3 w-3" />}
          {statusLabel}
        </span>
      </div>

      {/* Character + info */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#FFF0E5] text-3xl font-bold">
          {character}
        </div>
        <div>
          <h3 className="font-baloo text-lg font-bold text-[#5C3D2E]">{title}</h3>
          <p className="text-sm text-[#7A6050]">{description}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[#5C3D2E]">
            {quiz.correctAnswers} / {quiz.totalCharacters} characters
          </span>
          <span className="font-semibold text-[#E8864A]">{percentage}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F5EBE0]">
          <div
            className="h-full rounded-full bg-[#E8864A] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Score & last attempt */}
      {(quiz.bestScore !== null || lastAttemptFormatted) && (
        <div className="flex items-center gap-4 text-xs text-[#B8956A]">
          {quiz.bestScore !== null && <span>Best score: {quiz.bestScore}%</span>}
          {lastAttemptFormatted && <span>Last attempt: {lastAttemptFormatted}</span>}
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto space-y-2">
        <Link
          href={href}
          className={cn(
            'flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-200',
            quiz.completed
              ? 'border-2 border-[#5BA550] text-[#5BA550] hover:bg-[#E8F5E4]'
              : 'bg-[#E8864A] text-white shadow-[0_2px_8px_rgba(232,134,74,0.3)] hover:bg-[#D35C2B] hover:shadow-[0_4px_12px_rgba(232,134,74,0.4)] hover:-translate-y-0.5'
          )}
        >
          {quiz.completed
            ? 'Retake Quiz'
            : isInProgress
              ? 'Continue Quiz'
              : 'Take the Quiz'}
        </Link>
        {!quiz.completed && (
          <p className="text-center text-xs text-[#B8956A]">
            {isInProgress
              ? `Score ${neededPercent}% more to complete`
              : 'Complete the quiz to mark as mastered'}
          </p>
        )}
      </div>
    </div>
  );
}

// --- Study Page ---

export default function StudyPage() {
  const visibleUpgrades = upgradeableCards.slice(0, 5);
  const remainingCount = upgradeableCards.length - visibleUpgrades.length;

  return (
    <div className="px-6">
      <FeedWrapper>
        <div className="flex flex-col gap-8">
          {/* 1. Page Header */}
          <div>
            <h1 className="font-baloo text-3xl font-bold text-[#5C3D2E]">Study</h1>
            <p className="text-[#7A6050]">Pick up where you left off</p>
          </div>

          {/* 2. Primary Action Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Review Cards */}
            <div className="flex flex-col gap-4 rounded-xl border border-[#E8CDB5] bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFF0E5] text-2xl">
                🔄
              </div>
              <div>
                <h2 className="font-baloo text-lg font-bold text-[#5C3D2E]">Review Cards</h2>
                <p className="text-sm text-[#7A6050]">Strengthen what you&apos;ve learned</p>
              </div>
              <div className="py-2">
                <span className="text-4xl font-bold text-[#E8864A]">{reviewsDue}</span>
                <span className="ml-2 text-sm text-[#7A6050]">cards due</span>
              </div>
              <Link
                href="/study/review"
                className="flex w-full items-center justify-center rounded-lg bg-[#E8864A] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_2px_8px_rgba(232,134,74,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D35C2B] hover:shadow-[0_4px_12px_rgba(232,134,74,0.4)]"
              >
                Start Review
              </Link>
            </div>

            {/* Learn New Words */}
            <div className="flex flex-col gap-4 rounded-xl border border-[#E8CDB5] bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#E8F5E4] text-2xl">
                ✨
              </div>
              <div>
                <h2 className="font-baloo text-lg font-bold text-[#5C3D2E]">Learn New Words</h2>
                <p className="text-sm text-[#7A6050]">Add new vocabulary to your deck</p>
              </div>
              <div className="py-2">
                <span className="text-4xl font-bold text-[#5BA550]">{newCardsAvailable}</span>
                <span className="ml-2 text-sm text-[#7A6050]">new words ready</span>
              </div>
              <Link
                href="/study/learn"
                className="flex w-full items-center justify-center rounded-lg border-2 border-[#5BA550] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#5BA550] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#5BA550] hover:text-white"
              >
                Learn New Cards
              </Link>
            </div>
          </div>

          {/* 3. Upgrade Cards Section */}
          <div className="rounded-xl border border-[#E8CDB5] bg-white p-6">
            {/* Header */}
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EDE0F5] text-xl">
                  ⬆️
                </div>
                <div>
                  <p className="font-baloo font-bold text-[#5C3D2E]">
                    <span className="text-[#7A3BA0]">{upgradeableCards.length}</span> cards ready to
                    upgrade
                  </p>
                  <p className="text-sm text-[#7A6050]">
                    Learn the kanji to unlock the full card
                  </p>
                </div>
              </div>
              <Link
                href="#"
                className="flex items-center justify-center rounded-lg bg-[#7A3BA0] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#6A2E8E] hover:shadow-[0_4px_12px_rgba(122,59,160,0.3)]"
              >
                Start Upgrades
              </Link>
            </div>

            {/* Preview grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {visibleUpgrades.map(card => (
                <div
                  key={card.id}
                  className="group relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-[#E8D5F0] bg-[#FAF5FF] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#7A3BA0] hover:shadow-md"
                >
                  {/* Badge */}
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#7A3BA0] text-[10px] font-bold text-white">
                    ↑
                  </div>
                  <span className="text-2xl font-bold text-[#5C3D2E]">{card.reading}</span>
                  <span className="text-sm text-[#7A3BA0]">→ {card.kanji}</span>
                  <span className="text-xs text-[#B8956A]">{card.meaning}</span>
                </div>
              ))}
            </div>

            {/* More count */}
            {remainingCount > 0 && (
              <p className="mt-4 text-center text-sm text-[#B8956A]">
                +{remainingCount} more upgradeable cards
              </p>
            )}
          </div>

          {/* 4. Kana Mastery Section */}
          <div>
            <div className="mb-4">
              <h2 className="font-baloo text-2xl font-bold text-[#5C3D2E]">Kana Mastery</h2>
              <p className="text-sm text-[#7A6050]">
                Complete both quizzes to prove your kana knowledge — practice mode doesn&apos;t
                count
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <KanaQuizCard
                title="Hiragana"
                description="Master the basic Japanese alphabet"
                character="あ"
                quiz={hiraganaQuiz}
                href="/study/hiragana-quiz"
              />
              <KanaQuizCard
                title="Katakana"
                description="Master the secondary Japanese alphabet"
                character="カ"
                quiz={katakanaQuiz}
                href="/study/katakana-quiz"
              />
            </div>
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
}
