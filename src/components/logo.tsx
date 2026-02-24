import Link from 'next/link';

import { Mascot } from './mascot';

export const Logo = () => {
  const content = <h2 className='font-cherry-bomb text-4xl font-bold text-primary-foreground '>Japaneasy</h2>;

  return (
    <Link
      href='/dashboard'
      className='cursor-pointer'
    >
      {content}
    </Link>
  );
};
