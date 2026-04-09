'use client';

import { useRouter } from 'next/navigation';
import { createCourseAction, updateCourseAction } from '@/server/actions/admin-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { courseSchema } from '@/lib/validations/admin';
import type { CourseFormValues } from '@/lib/validations/admin';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CourseFormProps {
  initialData?: CourseFormValues & { id: string };
  units: { id: string; title: string; level: string }[];
}

export function CourseForm({ initialData, units }: CourseFormProps) {
  const router = useRouter();
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData ?? {
      unitId: '',
      title: '',
      description: '',
      displayOrder: 0,
      isPublished: false,
    },
  });

  const onSubmit = async (values: CourseFormValues) => {
    const result = initialData
      ? await updateCourseAction(initialData.id, values)
      : await createCourseAction(values);

    if (result.success) {
      toast.success(result.message);
      router.push('/admin/courses');
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='max-w-lg space-y-4'
      >
        <FormField
          control={form.control}
          name='unitId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select unit' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {units.map(u => (
                    <SelectItem
                      key={u.id}
                      value={u.id}
                    >
                      {u.level} — {u.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='displayOrder'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='isPublished'
          render={({ field }) => (
            <FormItem className='flex items-center gap-2'>
              <FormControl>
                <input
                  type='checkbox'
                  checked={field.value}
                  onChange={field.onChange}
                  className='h-4 w-4'
                />
              </FormControl>
              <FormLabel className='!mt-0'>Published</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex gap-2 pt-4'>
          <Button
            type='submit'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? 'Saving...'
              : initialData
                ? 'Update Course'
                : 'Create Course'}
          </Button>
          <Button
            type='button'
            variant='default'
            onClick={() => router.push('/admin/courses')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
