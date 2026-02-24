

import Link from 'next/link';

import { Mascot } from './mascot';

export const Logo = () => {


  const content = (
    <div className='font-cherry-bomb flex items-center gap-2 text-4xl'>
      <Mascot
        size='xs'
        expression='happy'
      />
      Japaneasy
    </div>
  );

  return <Link href='/dashboard' className='cursor-pointer'>{content}</Link>;
};
