'use server';

import { headers } from 'next/headers';
import { initializeUserProgress } from '@/server/mutations';

import { auth } from '@/lib/auth';
import { ActionResponse } from '@/lib/types';

export const handleSignIn = async (values: {
  email: string;
  password: string;
}): Promise<ActionResponse> => {
  try {
    await auth.api.signInEmail({
      body: {
        email: values.email,
        password: values.password,
      },
    });

    return { success: true, message: 'Sign in successful' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid email or password';
    return { success: false, message };
  }
};

export const handleSignUp = async (values: {
  email: string;
  password: string;
}): Promise<ActionResponse> => {
  try {
    const { user } = await auth.api.signUpEmail({
      body: {
        name: '',
        email: values.email,
        password: values.password,
      },
    });
    await initializeUserProgress(user.id);
    return { success: true, message: 'Account created successfully' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create account';
    return { success: false, message };
  }
};

export async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const { user } = session;

  return user;
}
