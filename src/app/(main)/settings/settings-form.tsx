'use client';

import { useState, useTransition } from 'react';
import { changePassword, updateName } from '@/server/actions/settings-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Database,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { FeedWrapper } from '@/components/layout/feed-wrapper';

// --- Schemas ---

const nameSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// --- Types ---

type SettingsFormProps = {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
};

// --- Component ---

export function SettingsForm({ user }: SettingsFormProps) {
  const [nameSuccess, setNameSuccess] = useState<string | undefined>();
  const [nameError, setNameError] = useState<string | undefined>();
  const [passwordSuccess, setPasswordSuccess] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isNamePending, startNameTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const nameForm = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: user.name },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  function onNameSubmit(data: z.infer<typeof nameSchema>) {
    setNameSuccess(undefined);
    setNameError(undefined);
    startNameTransition(async () => {
      const result = await updateName(data.name);
      if (result.success) {
        setNameSuccess(result.message);
      } else {
        setNameError(result.message);
      }
    });
  }

  function onPasswordSubmit(data: z.infer<typeof passwordSchema>) {
    setPasswordSuccess(undefined);
    setPasswordError(undefined);
    startPasswordTransition(async () => {
      const result = await changePassword(data.currentPassword, data.newPassword);
      if (result.success) {
        setPasswordSuccess(result.message);
        passwordForm.reset();
      } else {
        setPasswordError(result.message);
      }
    });
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className='px-6'>
      <FeedWrapper>
        <div className='flex max-w-2xl flex-col gap-8'>
          {/* Page Header */}
          <div>
            <h1 className='font-baloo text-3xl font-bold text-[#5C3D2E]'>Settings</h1>
            <p className='text-[#7A6050]'>Manage your account and preferences</p>
          </div>

          {/* Section 1: Account Information */}
          <section className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Mail className='h-5 w-5 text-[#E8864A]' />
              <h2 className='font-baloo text-xl font-bold text-[#5C3D2E]'>Account Information</h2>
            </div>
            <div className='rounded-xl border border-[#E8CDB5] bg-white p-6'>
              <div className='space-y-3'>
                <div>
                  <p className='text-sm font-medium text-[#7A6050]'>Email</p>
                  <p className='text-[#5C3D2E]'>{user.email}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-[#7A6050]'>Member since</p>
                  <p className='text-[#5C3D2E]'>{memberSince}</p>
                </div>
              </div>
            </div>
          </section>

          <Separator className='bg-[#E8CDB5]' />

          {/* Section 2: Profile */}
          <section className='space-y-4'>
            <div className='flex items-center gap-2'>
              <User className='h-5 w-5 text-[#E8864A]' />
              <h2 className='font-baloo text-xl font-bold text-[#5C3D2E]'>Profile</h2>
            </div>
            <div className='rounded-xl border border-[#E8CDB5] bg-white p-6'>
              <form onSubmit={nameForm.handleSubmit(onNameSubmit)}>
                <FieldGroup>
                  <Controller
                    name='name'
                    control={nameForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='name'>Display Name</FieldLabel>
                        <Input
                          id='name'
                          placeholder='Your name'
                          {...field}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  {nameSuccess && (
                    <p className='flex items-center gap-1.5 text-sm text-emerald-600'>
                      <CheckCircle className='h-4 w-4' />
                      {nameSuccess}
                    </p>
                  )}
                  {nameError && <p className='text-destructive text-sm'>{nameError}</p>}
                  <Button
                    type='submit'
                    variant='primary'
                    className='w-fit cursor-pointer'
                    disabled={isNamePending}
                  >
                    {isNamePending ? <Loader2 className='animate-spin' /> : 'Save Name'}
                  </Button>
                </FieldGroup>
              </form>
            </div>
          </section>

          <Separator className='bg-[#E8CDB5]' />

          {/* Section 3: Security */}
          <section className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Lock className='h-5 w-5 text-[#E8864A]' />
              <h2 className='font-baloo text-xl font-bold text-[#5C3D2E]'>Security</h2>
            </div>
            <div className='rounded-xl border border-[#E8CDB5] bg-white p-6'>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <FieldGroup>
                  <Controller
                    name='currentPassword'
                    control={passwordForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='currentPassword'>Current Password</FieldLabel>
                        <div className='relative'>
                          <Input
                            id='currentPassword'
                            type={showCurrentPassword ? 'text' : 'password'}
                            {...field}
                          />
                          <button
                            type='button'
                            tabIndex={-1}
                            aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowCurrentPassword(p => !p)}
                            className='text-muted-foreground hover:text-primary absolute top-1/2 right-3 z-10 -translate-y-1/2 cursor-pointer bg-transparent p-0'
                          >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name='newPassword'
                    control={passwordForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='newPassword'>New Password</FieldLabel>
                        <div className='relative'>
                          <Input
                            id='newPassword'
                            type={showNewPassword ? 'text' : 'password'}
                            {...field}
                          />
                          <button
                            type='button'
                            tabIndex={-1}
                            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowNewPassword(p => !p)}
                            className='text-muted-foreground hover:text-primary absolute top-1/2 right-3 z-10 -translate-y-1/2 cursor-pointer bg-transparent p-0'
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name='confirmPassword'
                    control={passwordForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='confirmPassword'>Confirm New Password</FieldLabel>
                        <Input
                          id='confirmPassword'
                          type='password'
                          {...field}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  {passwordSuccess && (
                    <p className='flex items-center gap-1.5 text-sm text-emerald-600'>
                      <CheckCircle className='h-4 w-4' />
                      {passwordSuccess}
                    </p>
                  )}
                  {passwordError && <p className='text-destructive text-sm'>{passwordError}</p>}
                  <Button
                    type='submit'
                    variant='primary'
                    className='w-fit cursor-pointer'
                    disabled={isPasswordPending}
                  >
                    {isPasswordPending ? <Loader2 className='animate-spin' /> : 'Change Password'}
                  </Button>
                </FieldGroup>
              </form>
            </div>
          </section>

          <Separator className='bg-[#E8CDB5]' />

          {/* Section 4: Subscription (UI-only) */}
          <section className='space-y-4'>
            <div className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5 text-[#E8864A]' />
              <h2 className='font-baloo text-xl font-bold text-[#5C3D2E]'>Subscription</h2>
            </div>
            <div className='rounded-xl border border-[#E8CDB5] bg-white p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-semibold text-[#5C3D2E]'>Free Plan</p>
                  <p className='text-sm text-[#7A6050]'>
                    Basic access to vocabulary study and kana quizzes
                  </p>
                </div>
                <span className='rounded-full bg-[#F5EBE0] px-3 py-1 text-xs font-semibold text-[#7A6050]'>
                  Current
                </span>
              </div>
              <div className='mt-4 rounded-lg border border-dashed border-[#E8CDB5] bg-[#FFF8F3] p-4'>
                <p className='mb-1 font-semibold text-[#5C3D2E]'>Japaneasy Pro</p>
                <p className='mb-3 text-sm text-[#7A6050]'>
                  Unlimited reviews, advanced SRS settings, priority support, and offline mode.
                </p>
                <Button
                  variant='primary'
                  className='cursor-pointer'
                  disabled
                >
                  Coming Soon
                </Button>
              </div>
            </div>
          </section>

          <Separator className='bg-[#E8CDB5]' />

          {/* Section 5: Your Data (UI-only) */}
          <section className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Database className='h-5 w-5 text-[#E8864A]' />
              <h2 className='font-baloo text-xl font-bold text-[#5C3D2E]'>Your Data</h2>
            </div>
            <div className='rounded-xl border border-[#E8CDB5] bg-white p-6'>
              <p className='mb-3 text-sm text-[#7A6050]'>
                Request a copy of all your data including vocabulary progress, review history, and
                account information. We&apos;ll email you a download link when it&apos;s ready.
              </p>
              <Button
                variant='default'
                className='cursor-pointer'
                disabled
              >
                Request Data Export
              </Button>
            </div>
          </section>

          <Separator className='bg-[#E8CDB5]' />

          {/* Section 6: Danger Zone (UI-only) */}
          <section className='space-y-4 pb-12'>
            <div className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-rose-500' />
              <h2 className='font-baloo text-xl font-bold text-rose-600'>Danger Zone</h2>
            </div>
            <div className='rounded-xl border border-rose-200 bg-rose-50/50 p-6'>
              <p className='mb-1 font-semibold text-[#5C3D2E]'>Delete Account</p>
              <p className='mb-4 text-sm text-[#7A6050]'>
                Permanently delete your account and all associated data. This action cannot be
                undone.
              </p>
              <Button
                variant='danger'
                className='cursor-pointer'
                disabled
              >
                Delete Account
              </Button>
            </div>
          </section>
        </div>
      </FeedWrapper>
    </div>
  );
}
