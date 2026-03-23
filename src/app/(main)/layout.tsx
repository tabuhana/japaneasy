import { getUser } from '@/server/actions/auth-actions';
import { redirect } from 'next/navigation';

import { Header } from '@/components/layout/header';

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {


  return (
    <>
      <Header />
      <main className='mx-auto h-full max-w-6xl pt-6'>{children}</main>
    </>
  );
}
