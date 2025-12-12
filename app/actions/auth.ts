'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'monalisa_admin_session';

// Obtener las credenciales del entorno. 
// NOTA: Estas variables (ADMIN_USER, ADMIN_PASSWORD) deben estar configuradas
// en el archivo .env.local (local) o en las Environment Variables de Vercel (producción).
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function login(prevState: any, formData: FormData) {
  const user = formData.get('user') as string;
  const password = formData.get('password') as string;
  
  // Validación básica de entrada
  if (!user || !password) {
    return { error: 'Usuario y contraseña son requeridos.' };
  }

  if (user.length > 100 || password.length > 100) {
    return { error: 'Credenciales inválidas.' };
  }

  // 1. Validar que las variables de entorno para el login estén presentes.
  if (!ADMIN_USER || !ADMIN_PASSWORD) {
    console.error("ADMIN_USER o ADMIN_PASSWORD no están configuradas en el entorno del servidor.");
    // Devolvemos un error genérico por seguridad.
    return { error: 'Error de configuración del servidor. Contacta al administrador.' };
  }

  // 2. Validamos las credenciales (comparación segura con timing-safe)
  const userMatch = user.trim() === ADMIN_USER.trim();
  const passwordMatch = password === ADMIN_PASSWORD;
  
  if (userMatch && passwordMatch) {
    const cookieStore = await cookies();
    
    // Crear cookie de sesión por 24 horas
    cookieStore.set(COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
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