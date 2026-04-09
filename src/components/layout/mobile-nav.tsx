'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { useIsMobile } from '../hooks/use-mobile';
import { useMobileNav } from '../hooks/use-mobile-nav';
import { NavItem } from './nav-item';

export const MobileNav = () => {
  const { isOpen, onClose } = useMobileNav();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) onClose();
  }, [isMobile, onClose]);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <SheetContent side='right'>
        <SheetHeader>
          <SheetTitle asChild>
            <h1 className='font-cherry-bomb text-background text-outline pb-2 text-4xl font-bold hover:cursor-default'>
              Japaneasy
            </h1>
          </SheetTitle>
        </SheetHeader>
        <div className='flex flex-col gap-y-2 px-4'>
          <NavItem
            label='Home'
            href='/'
          />
          <NavItem
            label='Dictionary'
            href='/dictionary'
          />
        </div>
        <div className='mt-auto flex flex-col gap-y-2 px-4 pb-4'>
          <NavItem
            label='Settings'
            href='/settings'
          />
          <Button
            variant='dangerOutline'
            className='h-12 w-full cursor-pointer'
          >
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
