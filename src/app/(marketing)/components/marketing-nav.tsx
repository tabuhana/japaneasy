import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { WaveBackground } from '@/components/wave-background';

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
              <Button variant='outline'>Login</Button>
              <Button>Sign Up</Button>
            </div>
          </div>
        </header>
      </div>
    </>
  );
};
