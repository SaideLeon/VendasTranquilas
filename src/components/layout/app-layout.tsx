'use client';

import { usePathname } from 'next/navigation';
import AppHeader from '@/components/layout/app-header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noHeaderPaths = ['/login', '/'];
  const isPublicPage = noHeaderPaths.includes(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {!isPublicPage && <AppHeader />}
      <main className={cn("flex-1", !isPublicPage ? "container mx-auto p-4 md:p-8" : "")}>
        {children}
      </main>
      <Toaster />
    </div>
  );
}
