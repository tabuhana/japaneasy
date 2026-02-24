import { Mascot } from '@/components/mascot';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-screen'>
      <div className='flex flex-1 items-center justify-center'>{children}</div>
      <div className='bg-primary hidden flex-1 items-center justify-center md:flex flex-col gap-2'>
        <Mascot
          size='lg'
          expression='happy'
        />
         <h2 className="text-white font-cherry-bomb text-4xl md:text-7xl text-center">Japaneasy</h2>
      </div>
    </div>
  );
}
