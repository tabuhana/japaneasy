'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, User } from 'lucide-react';

import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Study', href: '/study' },
  { label: 'Learn', href: '/learn' },
];

export const Header = () => {
  const router = useRouter();

  const handleSignout = () => {
    signOut();
    router.push('/auth/signin');
  };

  return (
    <header className='bg-primary sticky top-0 z-40 border-b'>
      <div className='mx-auto max-w-7xl px-4 py-4'>
        <div className='flex items-center justify-between'>
          <h2 className='font-cherry-bomb text-primary-foreground text-outline text-4xl font-bold'>
            Japaneasy
          </h2>

          <nav className='hidden items-center gap-6 md:flex'>
            {navItems.map(item => (
              <Button asChild>
                <Link
                  href={item.href}
                  key={item.label}
                >
                  <span>{item.label}</span>
                </Link>
              </Button>
            ))}
            <Button onClick={handleSignout}>Logout</Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
