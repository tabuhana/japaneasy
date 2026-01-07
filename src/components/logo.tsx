'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Mascot } from './mascot';

export const Logo = () => {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  const content = (
    <div className='font-cherry-bomb flex items-center gap-2 text-4xl'>
      <Mascot
        size='xs'
        expression='happy'
      />
      Japaneasy
    </div>
  );

  if (isLandingPage) {
    return content;
  }

  return <Link href='/dashboard' className='cursor-pointer'>{content}</Link>;
};
