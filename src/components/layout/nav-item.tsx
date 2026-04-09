'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';

type Props = {
  label: string;
  href: string;
};

export const NavItem = ({ label, href }: Props) => {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Button
      variant={active ? 'sidebarOutline' : 'sidebar'}
      className='max-md:h-12'
      asChild
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
};
