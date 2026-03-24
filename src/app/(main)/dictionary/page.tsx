import { redirect } from 'next/navigation';
import { getUser } from '@/server/actions/auth-actions';

import { getUserDictionary } from '@/drizzle/queries';

import { DictionaryClient } from './dictionary-client';

export default async function DictionaryPage() {
  const user = await getUser();
  if (!user) redirect('/auth/signin');

  const wordProgress = await getUserDictionary(user.id);

  return (
    <div className='px-6'>
      <DictionaryClient wordProgress={wordProgress} />
    </div>
  );
}
