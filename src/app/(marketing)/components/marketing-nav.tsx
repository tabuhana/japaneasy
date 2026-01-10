import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { WaveBackground } from '@/components/wave-background';
import Link from 'next/link';

export const MarketingNav = () => {
  return (
    <>
      <WaveBackground variant='marketing' />

      <div className='relative z-10 flex flex-col'>
        {/* Header */}
        <header className='text-primary-foreground p-6'>
          <div className='flex items-center justify-between'>
            <Logo />
            <div className='flex items-center gap-3'>
              <Button variant='outline' asChild>
                <Link href='/auth/signin'>Sign In</Link>
              </Button>
              <Button asChild>
                <Link href='/auth/signup'>Sign Up</Link>
              </Button>
            </div>
          </div>
        </header>
      </div>
    </>
  );
};
