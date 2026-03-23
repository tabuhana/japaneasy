'use client';

import { useMemo, useState } from 'react';

import type { KatakanaChar } from '@/lib/katakana-data';
import { KATAKANA_ROWS } from '@/lib/katakana-data';

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

export default function KatakanaPage() {
  const [selectedRowIds, setSelectedRowIds] = useState<string[] | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const characters: KatakanaChar[] = useMemo(() => {
    if (!selectedRowIds) return [];
    const chars = KATAKANA_ROWS.filter(r => selectedRowIds.includes(r.id)).flatMap(
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
