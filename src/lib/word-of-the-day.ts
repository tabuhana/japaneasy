import { unstable_cache } from 'next/cache';

import type { WordOfTheDay } from '@/lib/types';

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

async function fetchRandomWord(): Promise<WordOfTheDay> {
  const res = await fetch('https://jlpt-vocab-api.vercel.app/api/words/random', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Word of the Day API returned ${res.status}`);
  }

  return res.json();
}

export async function getWordOfTheDay(): Promise<WordOfTheDay | null> {
  try {
    const dateKey = getTodayDateString();
    const cachedFetch = unstable_cache(fetchRandomWord, ['word-of-the-day', dateKey], {
      revalidate: 86400,
    });
    return await cachedFetch();
  } catch (error) {
    console.error('Failed to fetch Word of the Day:', error);
    return null;
  }
}
