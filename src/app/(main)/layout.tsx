import { redirect } from 'next/navigation';
import { getUser } from '@/server/actions/auth-actions';

import { Topnav } from '@/components/layout/nav';
import { Providers } from '@/components/providers/mobile-nav-provider';

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  if (!user) redirect('/auth/signin');

  return (
    <>
      <Topnav />
      <Providers />
      <main className='h-full'>
        <div className='mx-auto h-full max-w-7xl pt-6'>{children}</div>
      </main>
    </>
  );
}
