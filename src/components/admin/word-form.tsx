'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { createWordAction, updateWordAction } from '@/server/actions/admin-actions';

import { wordSchema } from '@/lib/validations/admin';

import type { WordFormValues } from '@/lib/validations/admin';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WordFormProps {
  initialData?: WordFormValues & { id: string };
  units: { id: string; title: string; level: string }[];
}

export function WordForm({ initialData, units }: WordFormProps) {
  const router = useRouter();
  const form = useForm<WordFormValues>({
    resolver: zodResolver(wordSchema),
    defaultValues: initialData ?? {
      unitId: '',
      kanji: '',
      kana: '',
      romaji: '',
      english: '',
      partOfSpeech: '',
      wordGroup: undefined,
      displayOrder: 0,
    },
  });

  const onSubmit = async (values: WordFormValues) => {
    const result = initialData
      ? await updateWordAction(initialData.id, values)
      : await createWordAction(values);

    if (result.success) {
      toast.success(result.message);
      router.push('/admin/words');
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
          name="unitId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {units.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.level} — {u.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="kanji"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kanji</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kana"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kana</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="romaji"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Romaji</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="english"
            render={({ field }) => (
              <FormItem>
                <FormLabel>English</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="partOfSpeech"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Part of Speech</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="wordGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Word Group</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
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
        </div>
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : initialData ? 'Update Word' : 'Create Word'}
          </Button>
          <Button type="button" variant="default" onClick={() => router.push('/admin/words')}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
