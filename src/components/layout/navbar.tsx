import { BookOpen, Flame } from 'lucide-react';

import { Mascot } from '../mascot';
import { Button } from '../ui/button';
import { WaveBackground } from '../wave-background';
import { Logo } from '../logo';

export const Navbar = () => {
  return (
    <>
      <WaveBackground variant='navbar' />

      <div className='relative z-10 flex flex-col'>
        {/* Header */}
        <header className='text-primary-foreground p-6'>
          <div className='flex items-center justify-between'>
            <Logo />
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur'>
                <Flame className='h-4 w-4 text-yellow-300' />
                <span className='font-semibold'>{7}</span>
              </div>
              <div className='h-10 w-10 overflow-hidden rounded-full bg-white/20 backdrop-blur'>
                <Mascot
                  size='sm'
                  expression='happy'
                />
              </div>
            </div>
          </div>

          {/* Greeting */}
          <div className='mt-8 flex flex-col items-center justify-between gap-4 md:flex-row'>
            <div className='flex-1 self-start'>
              <p className='text-sm text-white/80'>Welcome back!</p>
              <h1 className='text-3xl font-(--font-cherry-bomb)'>Keep up the great work!</h1>
            </div>
            <Button
              size='lg'
              className='bg-primary hover:bg-primary/90 text-primary-foreground w-full rounded-2xl py-6 text-lg font-semibold shadow-lg transition-all hover:shadow-xl md:w-auto'
            >
              <BookOpen className='mr-2 h-5 w-5' />
              Start Studying
            </Button>
          </div>
        </header>
      </div>
    </>
  );
};
