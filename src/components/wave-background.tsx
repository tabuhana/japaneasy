'use client';

export function WaveBackground({
  variant = 'navbar',
}: {
  variant?: 'marketing' | 'footer' | 'navbar' | 'study' | 'celebration';
}) {
  if (variant === 'marketing') {
    return (
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        {/* Top decorative wave */}
        <svg
          className='absolute top-0 left-0 h-[30%] w-full'
          viewBox='0 0 1440 400'
          preserveAspectRatio='none'
        >
          <path
            d='M0,0 L1440,0 L1440,250 C1200,350 960,200 720,280 C480,360 240,250 0,300 Z'
            fill='#FF6B35'
          />
          <path
            d='M0,0 L1440,0 L1440,180 C1100,280 800,150 500,220 C200,290 100,200 0,250 Z'
            fill='#FF8F5C'
          />
        </svg>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        {/* Bottom wave layers */}
        <svg
          className='absolute bottom-0 left-0 h-[60%] w-full'
          viewBox='0 0 1440 600'
          preserveAspectRatio='none'
        >
          <path
            d='M0,400 C320,500 420,300 720,350 C1020,400 1200,500 1440,400 L1440,600 L0,600 Z'
            fill='#FFE8DC'
            opacity='0.6'
          />
          <path
            d='M0,450 C280,380 520,520 800,450 C1080,380 1280,520 1440,450 L1440,600 L0,600 Z'
            fill='#FFCDB2'
            opacity='0.7'
          />
          <path
            d='M0,500 C360,450 600,550 900,500 C1200,450 1350,550 1440,500 L1440,600 L0,600 Z'
            fill='#FF6B35'
            opacity='0.3'
          />
        </svg>
      </div>
    );
  }

  if (variant === 'navbar') {
    return (
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <svg
          className='absolute top-0 left-0 h-[40%] w-full'
          viewBox='0 0 1440 400'
          preserveAspectRatio='none'
        >
          <path
            d='M0,0 L1440,0 L1440,250 C1200,350 960,200 720,280 C480,360 240,250 0,300 Z'
            fill='#FF6B35'
          />
          <path
            d='M0,0 L1440,0 L1440,180 C1100,280 800,150 500,220 C200,290 100,200 0,250 Z'
            fill='#FF8F5C'
          />
        </svg>
      </div>
    );
  }

  if (variant === 'study') {
    return (
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <svg
          className='absolute top-0 left-0 h-[25%] w-full'
          viewBox='0 0 1440 250'
          preserveAspectRatio='none'
        >
          <path
            d='M0,0 L1440,0 L1440,150 C1200,200 900,100 600,150 C300,200 100,120 0,180 Z'
            fill='#FF6B35'
          />
        </svg>
        <svg
          className='absolute bottom-0 left-0 h-[20%] w-full'
          viewBox='0 0 1440 200'
          preserveAspectRatio='none'
        >
          <path
            d='M0,200 L1440,200 L1440,100 C1200,50 900,150 600,80 C300,10 100,100 0,50 Z'
            fill='#FFE8DC'
            opacity='0.5'
          />
        </svg>
      </div>
    );
  }

  if (variant === 'celebration') {
    return (
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <svg
          className='absolute inset-0 h-full w-full'
          viewBox='0 0 1440 900'
          preserveAspectRatio='none'
        >
          <path
            d='M0,0 C200,100 400,0 600,50 C800,100 1000,0 1200,50 C1400,100 1440,50 1440,0 L1440,900 L0,900 Z'
            fill='#FFF5F0'
          />
          <ellipse
            cx='200'
            cy='150'
            rx='300'
            ry='200'
            fill='#FFE8DC'
            opacity='0.5'
          />
          <ellipse
            cx='1200'
            cy='700'
            rx='400'
            ry='250'
            fill='#FFCDB2'
            opacity='0.4'
          />
        </svg>
      </div>
    );
  }

  return null;
}
