import { ReactNode } from 'react';
import { TopNav } from '@/components/customer/TopNav';
import { BottomNav } from '@/components/customer/BottomNav';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-body pb-16 lg:pb-0">
      <TopNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
