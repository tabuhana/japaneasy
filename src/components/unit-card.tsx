'use client';

import { useState } from 'react';
import { ChevronDown, ClipboardList } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { ProgressBar } from './progress-bar';
import { Button } from './ui/button';

type ProgressItem = {
  label: string;
  value: number;
};

type UnitCardProps = {
  title: string;
  description: string;
  unitProgress: number;
  ctaLabel?: string;
  progressItems?: ProgressItem[];
  defaultOpen?: boolean;
  className?: string;
};

export const UnitCard = ({
  title,
  description,
  unitProgress,
  ctaLabel = 'Continue',
  progressItems = [],
  defaultOpen = false,
  className,
}: UnitCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'group ring-border/60 w-full overflow-hidden rounded-sm shadow-lg ring-1',
        className
      )}
    >
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <div className='flex flex-col gap-4 p-4'>
          <div className='flex gap-4'>
            <div className='flex min-w-0 flex-1 items-center'>
              <h2 className='text-primary-foreground font-bold tracking-tight text-balance md:text-2xl'>
                {title}
              </h2>
            </div>
            <Button variant='primary'>
              <ClipboardList className='size-4' />
              <span className='hidden sm:inline'>{ctaLabel}</span>
            </Button>
            {progressItems.length > 0 && (
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
            )}
          </div>
          <ProgressBar
              label={description}
              value={unitProgress}
              index={0}
            />
        </div>
        {/* ── Expandable progress bars section ─────────────────── */}
        {progressItems.length > 0 && (
          <CollapsibleContent className='overflow-hidden'>
            <div className='border-primary-foreground/15 border-t px-5 pt-4 pb-5 sm:px-6'>
              <p className='text-primary-foreground/60 mb-3 text-xs font-semibold tracking-widest uppercase'>
                Progress Levels
              </p>
              <div className='flex flex-col gap-4'>
                {progressItems.map((item, i) => (
                  <ProgressBar
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
};
