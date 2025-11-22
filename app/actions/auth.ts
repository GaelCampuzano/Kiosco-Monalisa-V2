'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'monalisa_admin_session';

export async function login(prevState: any, formData: FormData) {
  const user = formData.get('user') as string;
  const password = formData.get('password') as string;

  // Validamos contra las variables de entorno (.env.local)
  if (
    user === process.env.ADMIN_USER && 
    password === process.env.ADMIN_PASSWORD
  ) {
    const cookieStore = await cookies();
    
    // Crear cookie de sesión por 24 horas
    cookieStore.set(COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, 
      path: '/',
    });

    redirect('/admin');
  } else {
    return { error: 'Credenciales incorrectas. Intenta de nuevo.' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect('/login');
}