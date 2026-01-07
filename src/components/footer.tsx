import Link from 'next/link';
import { Github } from 'lucide-react';

import { WaveBackground } from './wave-background';

export const Footer = () => {
  return (
    <>
      <WaveBackground variant='footer' />

      <div className='relative p-6'>
        <div className='text-muted-foreground flex items-center justify-between text-sm'>
          <p>Copyright © 2026 Japaneasy. All rights reserved.</p>
          <Link href='https://github.com/tabuhana/japaneasy'>
            <Github className='size-6' />
          </Link>
        </div>
      </div>
    </>
  );
};
