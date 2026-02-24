import { Mascot } from '@/components/mascot';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='flex flex-col gap-4 p-6 md:p-10'>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-xs'>{children}</div>
        </div>
      </div>
      <div className='bg-primary relative hidden items-center justify-center lg:flex'>
        <Mascot
          size='lg'
          expression='happy'
        />
        <h2 className='font-cherry-bomb text-center text-4xl text-white md:text-7xl'>Japaneasy</h2>
      </div>
    </div>
  );
}
