import Link from 'next/link';
import { ChevronDown, User } from 'lucide-react';

import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Review', href: '/' },
  { label: 'Explore', href: '/' },
];

export const Header = () => {
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

          <div className='flex items-center gap-4'>

            <button
              type='button'
              className='border-border bg-background flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium'
            >
              <span className='text-lg leading-none'>🇯🇵</span>
              <ChevronDown className='h-3 w-3' />
            </button>

            <button
              type='button'
              className='border-border bg-background flex items-center gap-2 rounded-full border px-2 py-1'
            >
              <div className='bg-muted flex h-7 w-7 items-center justify-center rounded-full'>
                <User className='h-4 w-4' />
              </div>
              <ChevronDown className='h-3 w-3' />
            </button>
          </div>
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
