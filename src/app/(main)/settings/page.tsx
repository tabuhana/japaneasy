import { redirect } from 'next/navigation';

import { getUser } from '@/server/actions/auth-actions';

import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  return <SettingsForm user={user} />;
}
