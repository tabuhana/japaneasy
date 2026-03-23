'use client';

import { useMemo, useState } from 'react';

import type { HiraganaChar } from '@/lib/hiragana-data';
import { HIRAGANA_ROWS } from '@/lib/hiragana-data';

import PracticeSession from './practice-session';
import RowSelect from './row-select';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function HiraganaPage() {
  const [selectedRowIds, setSelectedRowIds] = useState<string[] | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const characters: HiraganaChar[] = useMemo(() => {
    if (!selectedRowIds) return [];
    const chars = HIRAGANA_ROWS.filter(r => selectedRowIds.includes(r.id)).flatMap(
      r => r.characters
    );
    return shuffleArray(chars);
  }, [selectedRowIds, sessionKey]);

  if (!selectedRowIds) {
    return <RowSelect onStart={ids => setSelectedRowIds(ids)} />;
  }

  return (
    <PracticeSession
      key={sessionKey}
      characters={characters}
      onComplete={() => {
        setSelectedRowIds(null);
        setSessionKey(prev => prev + 1);
      }}
    />
  );
}
