'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ClipboardList } from 'lucide-react';

import { UnitProgress } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { ProgressBar } from './progress-bar';
import { Button } from './ui/button';

type Props = {
  unit: UnitProgress;
};

export const UnitCard = ({ unit }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('group ring-border/60 w-full overflow-hidden rounded-sm shadow-lg ring-1')}>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <div className='bg-primary text-primary-foreground flex flex-col gap-4 rounded-sm p-4'>
          <div className='flex gap-4'>
            <div className='flex min-w-0 flex-1 flex-col items-start'>
              <h2 className='text-primary-foreground font-cherry-bomb text-outline font-bold tracking-tight text-balance md:text-5xl'>
                {unit.title}
              </h2>
            </div>
            <Button
              variant='primary'
              disabled={unit.wordsNewCount === 0}
              asChild={unit.wordsNewCount > 0}
            >
              {unit.wordsNewCount > 0 ? (
                <Link href='/learn'>
                  <ClipboardList className='size-4' />
                  <span className='hidden sm:inline'>Learn {unit.wordsNewCount} new words</span>
                </Link>
              ) : (
                <span className='hidden sm:inline'>No new words</span>
              )}
            </Button>

            <CollapsibleTrigger asChild>
              <Button
                variant='primaryOutline'
                size='icon'
                aria-label={isOpen ? 'Hide progress details' : 'Show progress details'}
                className='bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 focus-visible:ring-primary-foreground/50 flex cursor-pointer items-center justify-center transition-colors focus-visible:ring-2 focus-visible:outline-none'
              >
                <ChevronDown
                  className={cn(
                    'size-5 transition-transform duration-300 ease-in-out',
                    isOpen && 'rotate-180'
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
          <ProgressBar
            label={`${unit.wordsLearningCount + unit.wordsReviewingCount + unit.wordsMasteredCount} / ${unit.totalWords ?? 0}`}
            value={unit.wordsLearningCount + unit.wordsReviewingCount + unit.wordsMasteredCount}
            index={0}
          />
        </div>
        {/* ── Expandable progress bars section ─────────────────── */}

        <CollapsibleContent className='overflow-hidden'>
          <div className='text-primary px-5 pt-4 pb-5 sm:px-6'>
            <p className='mb-3 text-xs font-semibold tracking-widest uppercase'>
              Progress Distribution
            </p>
            <div className='flex flex-col gap-4'>
              <ProgressBar
                label='Learning Words'
                value={unit.wordsLearningCount}
                index={1}
              />
              <ProgressBar
                label='Reviewing Words'
                value={unit.wordsReviewingCount}
                index={2}
              />
              <ProgressBar
                label='Mastered Words'
                value={unit.wordsMasteredCount}
                index={3}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
