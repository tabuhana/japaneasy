'use client';

import { useRouter } from 'next/navigation';
import { createUnitAction, updateUnitAction } from '@/server/actions/admin-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { unitSchema } from '@/lib/validations/admin';
import type { UnitFormValues } from '@/lib/validations/admin';
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

interface UnitFormProps {
  initialData?: UnitFormValues & { id: string };
}

export function UnitForm({ initialData }: UnitFormProps) {
  const router = useRouter();
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: initialData ?? {
      level: 'N5',
      title: '',
      description: '',
      displayOrder: 0,
      totalWords: 0,
      isPublished: false,
      color: '',
    },
  });

  const onSubmit = async (values: UnitFormValues) => {
    const result = initialData
      ? await updateUnitAction(initialData.id, values)
      : await createUnitAction(values);

    if (result.success) {
      toast.success(result.message);
      router.push('/admin/units');
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
          name='level'
          render={({ field }) => (
            <FormItem>
              <FormLabel>JLPT Level</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select level' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {['N5', 'N4', 'N3', 'N2', 'N1'].map(l => (
                    <SelectItem
                      key={l}
                      value={l}
                    >
                      {l}
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
        <div className='grid grid-cols-2 gap-4'>
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
            name='totalWords'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Words</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    value={field.value ?? 0}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name='color'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  placeholder='e.g. #FF6B35'
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
                ? 'Update Unit'
                : 'Create Unit'}
          </Button>
          <Button
            type='button'
            variant='default'
            onClick={() => router.push('/admin/units')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
