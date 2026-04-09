'use client';

import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useMobileNav } from '../hooks/use-mobile-nav';

export const MobileNavToggle = () => {
  const { onOpen } = useMobileNav();

  return (
    <Button
      variant='ghost'
      size='icon'
      className='ml-auto cursor-pointer md:hidden'
      onClick={onOpen}
    >
      <Menu className='size-6' />
      <span className='sr-only'>Open menu</span>
    </Button>
  );
};
