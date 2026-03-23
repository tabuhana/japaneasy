'use client';

import { useRouter } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CourseFilterProps {
  units: { id: string; title: string; level: string }[];
  currentUnitId?: string;
}

export function CourseFilter({ units, currentUnitId }: CourseFilterProps) {
  const router = useRouter();

  return (
    <Select
      value={currentUnitId ?? 'all'}
      onValueChange={value => {
        if (value === 'all') {
          router.push('/admin/courses');
        } else {
          router.push(`/admin/courses?unitId=${value}`);
        }
      }}
    >
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Filter by unit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Units</SelectItem>
        {units.map(u => (
          <SelectItem key={u.id} value={u.id}>
            {u.level} — {u.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
