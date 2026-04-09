'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export function Pagination({ page, totalPages, total, pageSize }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(newPage));
    }
    router.push(`?${params.toString()}`);
  };

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className='flex items-center justify-between pt-4'>
      <p className='text-muted-foreground text-sm'>
        Showing {start}–{end} of {total}
      </p>
      <div className='flex items-center gap-2'>
        <Button
          variant='default'
          size='sm'
          onClick={() => navigate(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className='h-4 w-4' />
          Previous
        </Button>
        <span className='text-muted-foreground text-sm'>
          {page} / {totalPages}
        </span>
        <Button
          variant='default'
          size='sm'
          onClick={() => navigate(page + 1)}
          disabled={page >= totalPages}
        >
          Next
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
