import { verifySession } from '@/lib/auth-check';
import { redirect } from 'next/navigation';

import { AIChat } from './components/AIChat';
import { Background } from '@/app/components/Background';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAuth = await verifySession();

  if (!isAuth) {
    redirect('/login');
  }

  return (
    <div className="h-screen h-[100dvh] relative overflow-hidden flex flex-col">
      <Background />
      <main className="flex-1 relative z-10 overflow-y-auto pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right">
        {children}
      </main>
      <AIChat />
    </div>
  );
}
