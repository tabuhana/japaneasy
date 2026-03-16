'use client';

import { ChevronDown, ClipboardList } from 'lucide-react';
import { useState } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

import { ProgressBar } from './progress-bar';
import { Button } from './ui/button';

type ProgressItem = {
  label: string;
  value: number;
};

type UnitCardProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  progressItems?: ProgressItem[];
  defaultOpen?: boolean;
  className?: string;
};

export const UnitCard = ({
  title,
  description,
  ctaLabel = 'Continue',
  onCtaClick,
  progressItems = [],
  defaultOpen = false,
  className,
}: UnitCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'group ring-border/60 w-full max-w-md overflow-hidden rounded-2xl shadow-lg ring-1',
        className
      )}
    >
      <div className='bg-primary'>
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <div className='flex items-center gap-3 px-5 py-4 sm:px-6'>
            <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
              <h2 className='text-primary-foreground truncate text-lg font-bold tracking-tight text-balance sm:text-xl'>
                {title}
              </h2>
              <p className='text-primary-foreground/70 truncate text-sm'>{description}</p>
            </div>

            <Button
              variant='primary'
              onClick={onCtaClick}
              // className='bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 focus-visible:ring-primary-foreground/50 flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tracking-widest uppercase backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none'
            >
              <ClipboardList className='size-4' />
              <span className='hidden sm:inline'>{ctaLabel}</span>
            </Button>

            {progressItems.length > 0 && (
              <CollapsibleTrigger asChild>
                <Button
                  variant='primaryOutline'
                  aria-label={isOpen ? 'Hide progress details' : 'Show progress details'}
                  // className='bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 focus-visible:ring-primary-foreground/50 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none'
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
    </div>
  );
};
