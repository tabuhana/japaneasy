import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description: string;
  icon: string;
  href: string;
  accentColor?: string;
};

export const QuickPracticeCard = ({
  title,
  description,
  icon,
  href,
  accentColor = 'bg-accent/20',
}: Props) => {
  return (
    <Link
      href={href}
      className={cn(
        'group border-border bg-card flex w-full items-center gap-4 rounded-sm border-2 p-4 text-left transition-all duration-300',
        'hover:border-primary hover:scale-105] hover:shadow-lg'
      )}
    >
      <div
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl font-bold shadow-sm',
          accentColor
        )}
      >
        <span>{icon}</span>
      </div>

      <div className='min-w-0 flex-1'>
        <h4 className='text-foreground group-hover:text-primary text-lg font-bold transition-colors'>
          {title}
        </h4>
        <p className='text-muted-foreground truncate text-sm font-medium'>{description}</p>
      </div>

      <ChevronRight className='text-muted-foreground group-hover:text-primary h-6 w-6 transition-all duration-300 group-hover:translate-x-1' />
    </Link>
  );
};
