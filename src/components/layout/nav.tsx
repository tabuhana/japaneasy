import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { MobileNavToggle } from './mobile-nav-toggle';
import { NavItem } from './nav-item';

export const Topnav = ({ className }: { className?: string }) => {
  return (
    <nav className={cn('bg-primary/10 h-24 px-4', className)}>
      <div className='mx-auto flex h-full w-full max-w-7xl items-center justify-center px-6'>
        <h1 className='font-cherry-bomb text-background text-outline mr-8 pb-2 text-4xl font-bold hover:cursor-default lg:pb-4 lg:text-5xl'>
          Japaneasy
        </h1>

        <div className='hidden items-center gap-x-2 md:flex'>
          <NavItem
            label='Home'
            href='/'
          />
          <NavItem
            label='Dictionary'
            href='/dictionary'
          />
        </div>
        <div className='ml-auto hidden items-center gap-x-2 md:flex'>
          <NavItem
            label='Settings'
            href='/settings'
          />
          <Button
            variant='dangerOutline'
            className='cursor-pointer'
          >
            Sign Out
          </Button>
        </div>
        <MobileNavToggle />
      </div>
    </nav>
  );
};
