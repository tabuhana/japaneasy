import { redirect } from 'next/navigation';

import { getNewCards } from '@/server/actions/learn-actions';

import LearnSession from './learn-session';

export default async function LearnPage() {
  const result = await getNewCards();

  if (!result.success || !result.data?.cards.length) {
    redirect('/');
  }

  return <LearnSession cards={result.data.cards} />;
}
