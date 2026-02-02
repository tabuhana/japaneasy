'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

export async function signIn(values: { email: string; password: string }) {
  try {
    await auth.api.signInEmail({
      body: {
        email: values.email,
        password: values.password,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid email or password';
    return { error: message };
  }
  redirect('/dashboard');
}

export async function signUp(values: { name: string; email: string; password: string }) {
  try {
    await auth.api.signUpEmail({
      body: {
        name: values.name,
        email: values.email,
        password: values.password,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create account';
    return { error: message };
  }
  redirect('/dashboard');
}

export async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null

  const { user } = session

  return user;
}
