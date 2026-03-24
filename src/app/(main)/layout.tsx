import { redirect } from 'next/navigation';
import { getUser } from '@/server/actions/auth-actions';

import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  if (!user) redirect('/auth/signin');

  return (
    <>
      <Sidebar className='hidden lg:flex' />
      <main className='h-full pt-14 lg:pt-0 lg:pl-64'>
        <div className='mx-auto h-full max-w-6xl pt-6'>{children}</div>
      </main>
    </>
  );
}
