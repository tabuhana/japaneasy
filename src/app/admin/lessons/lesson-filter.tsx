'use client';

import { useRouter } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LessonFilterProps {
  courses: { id: string; title: string; unitLevel: string }[];
  currentCourseId?: string;
}

export function LessonFilter({ courses, currentCourseId }: LessonFilterProps) {
  const router = useRouter();

  return (
    <Select
      value={currentCourseId ?? 'all'}
      onValueChange={value => {
        if (value === 'all') {
          router.push('/admin/lessons');
        } else {
          router.push(`/admin/lessons?courseId=${value}`);
        }
      }}
    >
      <SelectTrigger className='w-64'>
        <SelectValue placeholder='Filter by course' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>All Courses</SelectItem>
        {courses.map(c => (
          <SelectItem
            key={c.id}
            value={c.id}
          >
            {c.unitLevel} — {c.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
