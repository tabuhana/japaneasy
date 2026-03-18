'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, User } from 'lucide-react';

import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Review', href: '/' },
  { label: 'Explore', href: '/' },
];

export const Header = () => {
  const router = useRouter();

  const handleSignout = () => {
    signOut();
    router.push('/auth/signin');
  };

  return (
    <header className='bg-primary sticky top-0 z-40 border-b'>
      <div className='mx-auto max-w-6xl px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-8'>
            <h2 className='font-cherry-bomb text-primary-foreground text-outline text-4xl font-bold'>
              Japaneasy
            </h2>

            <nav className='hidden items-center gap-6 md:flex'>
              {navItems.map(item => (
                <Link
                  href={item.href}
                  key={item.label}
                  className='text-primary-foreground p-2 font-medium hover:underline'
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <Button onClick={handleSignout}>Logout</Button>
        </div>

        <div className='mt-8'>
          <h1 className='text-primary-foreground font-cherry-bomb text-outline text-5xl leading-tight font-semibold'>
            Nathanさん、あえてうれしいよ。
          </h1>
        </div>
      </div>
    </header>
  );
};
