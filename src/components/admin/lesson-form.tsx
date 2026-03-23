'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { createLessonAction, updateLessonAction } from '@/server/actions/admin-actions';

import { lessonSchema } from '@/lib/validations/admin';

import type { LessonFormValues } from '@/lib/validations/admin';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface LessonFormProps {
  initialData?: LessonFormValues & { id: string };
  courses: { id: string; title: string; unitLevel: string }[];
}

export function LessonForm({ initialData, courses }: LessonFormProps) {
  const router = useRouter();
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: initialData ?? {
      courseId: '',
      title: '',
      content: '',
      displayOrder: 0,
    },
  });

  const onSubmit = async (values: LessonFormValues) => {
    const result = initialData
      ? await updateLessonAction(initialData.id, values)
      : await createLessonAction(values);

    if (result.success) {
      toast.success(result.message);
      router.push('/admin/lessons');
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-4">
        <FormField
          control={form.control}
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.unitLevel} — {c.title}
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
          name="title"
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea rows={6} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="displayOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : initialData ? 'Update Lesson' : 'Create Lesson'}
          </Button>
          <Button type="button" variant="default" onClick={() => router.push('/admin/lessons')}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
