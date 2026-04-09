'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

import { KATAKANA_ROWS } from '@/lib/katakana-data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface RowSelectProps {
  onStart: (selectedRowIds: string[]) => void;
}

export default function RowSelect({ onStart }: RowSelectProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = selected.size === KATAKANA_ROWS.length;

  const toggleRow = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(KATAKANA_ROWS.map(r => r.id)));
    }
  };

  return (
    <div className='mx-auto w-full max-w-2xl px-4 py-8'>
      <h1 className='text-foreground mb-2 text-2xl font-bold'>Katakana Practice</h1>
      <p className='text-muted-foreground mb-6 text-sm'>
        Select the rows you want to practice, then start.
      </p>

      <div className='mb-6 flex items-center justify-between'>
        <Button
          variant='default'
          size='sm'
          onClick={toggleAll}
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </Button>
        <span className='text-muted-foreground text-sm'>
          {selected.size} of {KATAKANA_ROWS.length} selected
        </span>
      </div>

      <div className='mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3'>
        {KATAKANA_ROWS.map(row => {
          const isSelected = selected.has(row.id);
          return (
            <button
              key={row.id}
              onClick={() => toggleRow(row.id)}
              className={cn(
                'relative rounded-2xl border-2 p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-muted hover:border-primary/40 bg-card shadow-sm'
              )}
            >
              {isSelected && (
                <div className='bg-primary absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full'>
                  <Check className='text-primary-foreground h-3 w-3' />
                </div>
              )}
              <p className='text-foreground mb-1 text-sm font-semibold'>{row.name}</p>
              <p className='text-muted-foreground text-lg tracking-widest'>
                {row.characters.map(c => c.kana).join(' ')}
              </p>
            </button>
          );
        })}
      </div>

      <Button
        onClick={() => onStart(Array.from(selected))}
        disabled={selected.size === 0}
        className='w-full py-6 text-base font-semibold'
      >
        Start Practice
      </Button>
    </div>
  );
}
