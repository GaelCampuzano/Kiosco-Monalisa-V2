import { verifySession } from '@/lib/auth-check';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAuth = await verifySession();

  if (!isAuth) {
    redirect('/login');
  }

  return <>{children}</>;
}
