import { redirect } from 'next/navigation';

import { getUserNewWords } from '@/drizzle/queries';

import { LearnSession } from './learn-session';

export default async function LearnPage() {
  const newWords = await getUserNewWords();

  if (!newWords) redirect('/study');

  return <LearnSession words={newWords} />;
}
