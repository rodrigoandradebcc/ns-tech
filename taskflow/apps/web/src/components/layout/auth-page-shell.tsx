import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Kanban } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AuthPageShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthPageShell({ title, description, children }: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center border-b border-border px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <Kanban className="size-5 text-primary" />
          TaskFlow Pro
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
