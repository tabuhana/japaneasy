import { redirect } from 'next/navigation';

import { getDueCards } from '@/server/actions/study-actions';

import StudySession from './study-session';

export default async function StudyPage() {
  const result = await getDueCards();

  if (!result.success || !result.data?.cards.length) {
    redirect('/');
  }

  return <StudySession cards={result.data.cards} />;
}
