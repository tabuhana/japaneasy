import { Flame } from 'lucide-react';

import { getUserReviewsDue } from '@/drizzle/queries';

import { Button } from './ui/button';

export const NotificationsCard = async () => {
  const reviewsDueCount = await getUserReviewsDue();

  return (
    <div className='flex flex-col gap-4'>
      <div className='font-baloo flex items-center justify-between font-bold'>
        <h1 className='text-2xl'>Welcome back!</h1>
        <div className='bg-primary text-primary-foreground flex items-center gap-0.5 rounded-2xl p-1.5 px-3 text-sm'>
          <Flame className='stroke-3 pb-1' />
          <span className='text-xl leading-none'>6</span>
        </div>
      </div>
      <div className='bg-primary/20 text-primary-foreground rounded-sm p-4'>
        <div className='flex items-center justify-between'>
          <p className='font-baloo text-xl font-bold'>You have {reviewsDueCount} reviews due</p>
          <Button variant='primary'>Review All</Button>
        </div>
      </div>
    </div>
  );
};
