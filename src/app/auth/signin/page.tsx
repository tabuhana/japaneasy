'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { handleSignIn } from '@/server/actions/auth-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { GoogleIcon } from '../components/google-icon';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    setError(undefined);
    startTransition(async () => {
      const result = await handleSignIn(data);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <form
      className='flex flex-col'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className='flex flex-col items-center gap-1 text-center'>
          <h1 className='font-cherry-bomb text-4xl font-bold'>Sign in</h1>
          <p className='text-muted-foreground text-sm text-balance'>
            Enter your email below to sign in to your account
          </p>
        </div>
        <Controller
          name='email'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='email'>Email</FieldLabel>
              <Input
                id='email'
                type='email'
                placeholder='m@example.com'
                required
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name='password'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className='flex items-center'>
                <FieldLabel htmlFor='password'>Password</FieldLabel>
                <Link
                  href='/auth/password-reset'
                  className='ml-auto text-sm underline-offset-4 hover:underline'
                >
                  Forgot your password?
                </Link>
              </div>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  {...field}
                />
                <button
                  type='button'
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(p => !p)}
                  className='text-muted-foreground hover:text-primary absolute top-1/2 right-3 z-10 m-0 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0'
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {error && <p className='text-destructive text-sm'>{error}</p>}
        <Field>
          <Button
            type='submit'
            className='cursor-pointer'
            variant='primary'
            disabled={isPending}
          >
            {isPending ? <Loader2 className='animate-spin' /> : 'Sign in'}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button
            type='button'
            className='cursor-pointer'
            disabled={isPending}
          >
            <GoogleIcon />
            Continue with Google
          </Button>
          <FieldDescription className='text-center'>
            Don&apos;t have an account?{' '}
            <Link
              href='/auth/signup'
              className='underline underline-offset-4'
            >
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
