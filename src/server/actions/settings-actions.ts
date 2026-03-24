'use server';

import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { ActionResponse } from '@/lib/types';

export const updateName = async (name: string): Promise<ActionResponse> => {
  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: { name },
    });

    return { success: true, message: 'Name updated successfully' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update name';
    return { success: false, message };
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<ActionResponse> => {
  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: { currentPassword, newPassword },
    });

    return { success: true, message: 'Password changed successfully' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to change password';
    return { success: false, message };
  }
};
