'use client'
import { useEffect, useState } from 'react';

export const ProgressBar = ({
  value,
  label,
  index = 0,
}: {
  value: number;
  label: string;
  index?: number;
}) => {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(value), 80 + index * 100);
    return () => clearTimeout(timeout);
  }, [value, index]);

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium'>{label}</span>
        <span className='text-xs font-bold tabular-nums'>{value}%</span>
      </div>
      {/* Track */}
      <div
        className='bg-current/20 relative h-2.5 w-full overflow-hidden rounded-full'
        role='progressbar'
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} progress`}
      >
        {/* Fill – white bar */}
        <div
          className='bg-current h-full rounded-full transition-all duration-700 ease-out'
          style={{ width: `${animated}%` }}
        />
      </div>
    </div>
  );
}