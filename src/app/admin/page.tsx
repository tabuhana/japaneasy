import Link from 'next/link';
import { BookOpen, FileText, GraduationCap, Type } from 'lucide-react';

const sections = [
  { href: '/admin/units', label: 'Units', description: 'Manage JLPT level units', icon: GraduationCap },
  { href: '/admin/courses', label: 'Courses', description: 'Manage courses within units', icon: BookOpen },
  { href: '/admin/lessons', label: 'Lessons', description: 'Manage lessons within courses', icon: FileText },
  { href: '/admin/words', label: 'Words', description: 'Manage vocabulary words', icon: Type },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(section => (
          <Link
            key={section.href}
            href={section.href}
            className="flex flex-col gap-2 rounded-lg border p-6 transition-colors hover:bg-accent"
          >
            <section.icon className="h-8 w-8 text-primary" />
            <h2 className="text-lg font-semibold">{section.label}</h2>
            <p className="text-sm text-muted-foreground">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
