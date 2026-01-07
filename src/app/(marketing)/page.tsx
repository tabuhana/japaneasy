'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { Logo } from '@/components/logo';
import { Mascot } from '@/components/mascot';
import { WaveBackground } from '@/components/wave-background';
import { MarketingNav } from '@/app/(marketing)/components/marketing-nav';

export default function LandingScreen() {
  return (
    <div className='z-10 flex min-h-screen flex-col'>
      {/* Header */}
      <MarketingNav />

      {/* Main Content */}
      <main className='relative z-10 flex flex-1 flex-col items-center justify-center px-6'>
        <div className='max-w-lg text-center'>
          {/* Mascot */}
          <div className='mb-8 flex justify-center'>
            <div className='relative'>
              <Mascot
                size='lg'
                expression='happy'
              />
              <div className='absolute -top-2 -right-2 animate-bounce'>
                <Sparkles className='text-primary h-6 w-6' />
              </div>
            </div>
          </div>

          {/* Logo & Tagline */}
          <h1 className='font-cherry-bomb text-primary mb-4 text-5xl leading-tight md:text-6xl'>
            Japaneasy
          </h1>
          <p className='text-muted-foreground mb-2 text-xl md:text-2xl'>
            Master Japanese the easy way
          </p>
          <p className='text-muted-foreground mb-10'>
            Fun, bite-sized lessons that make learning feel like a game
          </p>

          {/* CTA Button */}
          <Button
            size='lg'
            className='bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-6 text-lg font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl'
            asChild
          >
            <Link href='/dashboard'>
              Get Started
              <span className='ml-2'>→</span>
            </Link>
          </Button>

          {/* Social Proof */}
          <div className='text-muted-foreground mt-10 flex items-center justify-center gap-6 text-sm'>
            <div className='flex items-center gap-1'>
              <span className='text-primary font-semibold'>10K+</span>
              <span>learners</span>
            </div>
            <div className='bg-muted-foreground h-1 w-1 rounded-full' />
            <div className='flex items-center gap-1'>
              <span className='text-primary font-semibold'>4.9</span>
              <span>★ rating</span>
            </div>
          </div>
        </div>

        <div className='text-muted-foreground flex justify-center gap-8 text-sm'>
          <div className='flex items-center gap-2'>
            <span className='text-lg'>🎮</span>
            <span>Gamified</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-lg'>⚡</span>
            <span>Quick lessons</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-lg'>🏆</span>
            <span>Track progress</span>
          </div>
        </div>
      </main>

      {/* Footer Features */}
      <Footer />
    </div>
  );
}
