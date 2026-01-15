import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';

export async function verifySession() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('monalisa_admin_session');

  if (!authCookie || authCookie.value !== 'authenticated') {
    return false;
  }
  return true;
}

export async function requireAuth() {
  const isAuth = await verifySession();
  if (!isAuth) {
    throw new Error('Unauthorized');
  }
}
