import { redirect } from 'next/navigation';

import { getUser } from '@/server/actions/auth-actions';

import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  if (!user) redirect('/auth/signin');
  if (!user.isAdmin) redirect('/');

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
