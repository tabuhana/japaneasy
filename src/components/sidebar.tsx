import Link from 'next/link';

import { cn } from '@/lib/utils';

import { SidebarItem } from './sidebar-item';
import { Button } from './ui/button';

export const Sidebar = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'bg-primary/10 top-0 left-0 flex h-full flex-col px-4 lg:fixed lg:w-64',
        className
      )}
    >
      <Link
        href='/'
        className='mb-4 flex items-center p-4'
      >
        <h1 className='font-cherry-bomb text-background  text-outline hover:text-primary text-4xl font-bold transition-colors duration-300 ease-out'>
          Japaneasy
        </h1>
      </Link>
      <div className='flex flex-1 flex-col gap-y-2'>
        <SidebarItem
          label='Home'
          href='/'
        />
        <SidebarItem
          label='Study'
          href='/study'
        />
        <SidebarItem
          label='Dictionary'
          href='/dictionary'
        />
      </div>
      <div className='flex flex-col gap-y-2 pb-4'>
        <SidebarItem
          label='Settings'
          href='/settings'
        />
        <Button
          variant='sidebar'
          className='h-13 cursor-pointer justify-start'
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};
