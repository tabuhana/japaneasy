'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Flame, Search, X } from 'lucide-react';

import type { InferSelectModel } from 'drizzle-orm';

import type { userWordProgress, words } from '@/drizzle/schema';

// ── Types ──

type WordProgressRow = InferSelectModel<typeof userWordProgress> & {
  word: InferSelectModel<typeof words>;
};

type SrsStage = 'New' | 'Apprentice' | 'Guru' | 'Master' | 'Enlightened';

interface DictionaryClientProps {
  wordProgress: WordProgressRow[];
}

// ── Constants ──

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

const SRS_STAGES: SrsStage[] = ['New', 'Apprentice', 'Guru', 'Master', 'Enlightened'];

const SRS_STAGE_COLORS: Record<SrsStage, { bg: string; text: string }> = {
  New: { bg: 'bg-[#F5EBE0]', text: 'text-[#7A6050]' },
  Apprentice: { bg: 'bg-[#FFF0E5]', text: 'text-[#E8864A]' },
  Guru: { bg: 'bg-[#E8F5E9]', text: 'text-[#4CAF50]' },
  Master: { bg: 'bg-[#E3F2FD]', text: 'text-[#2196F3]' },
  Enlightened: { bg: 'bg-[#F3E5F5]', text: 'text-[#9C27B0]' },
};

// ── Helpers ──

function deriveSrsStage(status: string, interval: number): SrsStage {
  switch (status) {
    case 'new':
      return 'New';
    case 'learning':
      return 'Apprentice';
    case 'reviewing':
      return interval >= 21 ? 'Master' : 'Guru';
    case 'mastered':
      return 'Enlightened';
    default:
      return 'New';
  }
}

function formatNextReview(nextReviewDate: Date | null): string {
  if (!nextReviewDate) return '—';

  const now = new Date();
  const next = nextReviewDate instanceof Date ? nextReviewDate : new Date(nextReviewDate);
  const diffMs = next.getTime() - now.getTime();

  if (diffMs <= 0) return 'Now';

  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 60) return `${diffMins}m`;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return `${diffDays}d`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo`;
}

// ── Dropdown Component ──

function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (val: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = value !== null;

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-colors ${
          isActive
            ? 'border-[#E8864A] bg-[#FFF0E5] text-[#E8864A]'
            : 'border-[#E8CDB5] bg-white text-[#7A6050] hover:border-[#E8864A]/50'
        }`}
      >
        {value ?? label}
        <ChevronDown
          className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className='absolute top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-lg border-2 border-[#E8CDB5] bg-white shadow-lg'>
          <button
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className={`w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors hover:bg-[#FFF0E5] ${
              !value ? 'font-semibold text-[#E8864A]' : 'text-[#7A6050]'
            }`}
          >
            All
          </button>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors hover:bg-[#FFF0E5] ${
                value === opt ? 'font-semibold text-[#E8864A]' : 'text-[#7A6050]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──

export function DictionaryClient({ wordProgress }: DictionaryClientProps) {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [posFilter, setPosFilter] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState<string | null>(null);

  const uniquePartsOfSpeech = useMemo(() => {
    const set = new Set<string>();
    wordProgress.forEach(wp => {
      if (wp.word.partOfSpeech) set.add(wp.word.partOfSpeech);
    });
    return Array.from(set).sort();
  }, [wordProgress]);

  const uniqueWordGroups = useMemo(() => {
    const set = new Set<string>();
    wordProgress.forEach(wp => {
      if (wp.word.wordGroup) set.add(wp.word.wordGroup);
    });
    return Array.from(set).sort();
  }, [wordProgress]);

  const filteredWords = useMemo(() => {
    return wordProgress.filter(wp => {
      const w = wp.word;
      const searchLower = search.toLowerCase();

      if (
        search &&
        ![w.kanji, w.kana, w.english].some(field =>
          field?.toLowerCase().includes(searchLower)
        )
      ) {
        return false;
      }
      if (levelFilter && w.level !== levelFilter) return false;
      if (posFilter && w.partOfSpeech !== posFilter) return false;
      if (groupFilter && w.wordGroup !== groupFilter) return false;

      return true;
    });
  }, [wordProgress, search, levelFilter, posFilter, groupFilter]);

  const stageCounts = useMemo(() => {
    const counts: Record<SrsStage, number> = {
      New: 0,
      Apprentice: 0,
      Guru: 0,
      Master: 0,
      Enlightened: 0,
    };
    filteredWords.forEach(wp => {
      const stage = deriveSrsStage(wp.status, wp.interval);
      counts[stage]++;
    });
    return counts;
  }, [filteredWords]);

  const hasActiveFilters = search || levelFilter || posFilter || groupFilter;

  function clearAllFilters() {
    setSearch('');
    setLevelFilter(null);
    setPosFilter(null);
    setGroupFilter(null);
  }

  return (
    <div className='flex flex-col gap-5 pb-10'>
      {/* Header */}
      <div>
        <h1 className='font-baloo text-3xl font-bold text-[#5C3D2E]'>Dictionary</h1>
        <p className='text-sm text-[#B8956A]'>
          {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''} in your collection
        </p>
      </div>

      {/* Search Bar */}
      <div className='relative'>
        <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#B8956A]' />
        <input
          type='text'
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder='Search by kanji, reading, or meaning...'
          className='w-full rounded-lg border-2 border-[#E8CDB5] bg-white py-2 pr-3 pl-9 text-sm text-[#5C3D2E] placeholder-[#B8956A] transition-colors focus:border-[#E8864A] focus:outline-none'
        />
      </div>

      {/* Filter Row */}
      <div className='flex flex-wrap items-center gap-2'>
        {/* JLPT Level Buttons */}
        <div className='flex items-center gap-1'>
          <button
            onClick={() => setLevelFilter(null)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              !levelFilter
                ? 'bg-[#E8864A] text-white'
                : 'border-2 border-[#E8CDB5] bg-white text-[#7A6050] hover:border-[#E8864A]/50'
            }`}
          >
            All
          </button>
          {JLPT_LEVELS.map(level => (
            <button
              key={level}
              onClick={() => setLevelFilter(levelFilter === level ? null : level)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                levelFilter === level
                  ? 'bg-[#E8864A] text-white'
                  : 'border-2 border-[#E8CDB5] bg-white text-[#7A6050] hover:border-[#E8864A]/50'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className='mx-1 h-8 w-px bg-[#E8CDB5]' />

        {/* Dropdowns */}
        <FilterDropdown
          label='Part of Speech'
          options={uniquePartsOfSpeech}
          value={posFilter}
          onChange={setPosFilter}
        />
        <FilterDropdown
          label='Word Group'
          options={uniqueWordGroups}
          value={groupFilter}
          onChange={setGroupFilter}
        />

        {/* Clear All */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className='ml-1 cursor-pointer text-sm font-medium text-[#E8864A] transition-colors hover:text-[#d47740]'
          >
            Clear all
          </button>
        )}
      </div>

      {/* SRS Stage Summary Pills */}
      <div className='flex flex-wrap gap-2'>
        {SRS_STAGES.map(stage => (
          <span
            key={stage}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${SRS_STAGE_COLORS[stage].bg} ${SRS_STAGE_COLORS[stage].text}`}
          >
            {stage}
            <span className='font-semibold'>{stageCounts[stage]}</span>
          </span>
        ))}
      </div>

      {/* Word Cards Grid */}
      {filteredWords.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredWords.map(wp => {
            const stage = deriveSrsStage(wp.status, wp.interval);
            const colors = SRS_STAGE_COLORS[stage];

            return (
              <div
                key={wp.id}
                className='flex flex-col rounded-lg border-2 border-[#E8CDB5] bg-white p-4 transition-all hover:border-[#E8864A] hover:shadow-md hover:-translate-y-0.5'
              >
                {/* Top row: badges */}
                <div className='mb-3 flex items-center justify-between'>
                  <span className='rounded-md bg-[#FFF0E5] px-2 py-0.5 text-xs font-semibold text-[#E8864A]'>
                    {wp.word.level}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text}`}
                  >
                    {stage}
                  </span>
                </div>

                {/* Kanji */}
                <p className='text-2xl font-bold text-[#5C3D2E]'>
                  {wp.word.kanji || wp.word.kana}
                </p>

                {/* Reading */}
                <p className='text-sm text-[#B8956A]'>{wp.word.kana}</p>

                {/* Meaning */}
                <p className='mt-1 text-sm text-[#7A6050]'>{wp.word.english}</p>

                {/* Tags */}
                <div className='mt-3 flex flex-wrap gap-1.5'>
                  {wp.word.partOfSpeech && (
                    <span className='rounded-full bg-[#F5EBE0] px-2 py-0.5 text-xs text-[#7A6050]'>
                      {wp.word.partOfSpeech}
                    </span>
                  )}
                  {wp.word.wordGroup && (
                    <span className='rounded-full bg-[#F5EBE0] px-2 py-0.5 text-xs text-[#7A6050]'>
                      {wp.word.wordGroup}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className='mt-auto pt-3'>
                  <hr className='mb-2 border-[#F0DCC8]' />
                  <div className='flex items-center justify-between text-xs text-[#B8956A]'>
                    <span className='flex items-center gap-1'>
                      <Flame className='size-3.5 text-[#E8864A]' />
                      {wp.streakCount}
                    </span>
                    <span>{formatNextReview(wp.nextReviewDate)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className='flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[#E8CDB5] bg-[#FFF9F5] py-16'>
          <p className='font-medium text-[#7A6050]'>No words found</p>
          <p className='text-sm text-[#B8956A]'>
            {hasActiveFilters
              ? 'Try adjusting your filters'
              : 'Start studying to build your dictionary'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className='mt-1 cursor-pointer rounded-lg bg-[#E8864A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#d47740]'
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
