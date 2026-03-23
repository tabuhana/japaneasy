'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, FileText, GraduationCap, LayoutDashboard, Type } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/units', label: 'Units', icon: GraduationCap },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/lessons', label: 'Lessons', icon: FileText },
  { href: '/admin/words', label: 'Words', icon: Type },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-card p-4">
      <h2 className="mb-6 px-2 text-lg font-semibold">Admin Panel</h2>
      <nav className="flex flex-col gap-1">
        {navItems.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
