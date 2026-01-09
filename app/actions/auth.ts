'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'monalisa_admin_session';

// Obtener las credenciales del entorno. 
// NOTA: Estas variables (ADMIN_USER, ADMIN_PASSWORD) deben estar configuradas
// en el archivo .env.local (local) o en las Environment Variables de Vercel (producción).
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function login(prevState: unknown, formData: FormData) {
  try {
    const user = formData.get('user') as string;
    const password = formData.get('password') as string;

    // Basic input validation
    if (!user || !password) {
      return { error: 'Usuario y contraseña son requeridos.' };
    }

    if (user.length > 100 || password.length > 100) {
      return { error: 'Credenciales inválidas.' };
    }

    // 1. Validar configuración (Variables de entorno)
    if (!ADMIN_USER || !ADMIN_PASSWORD) {
      console.error("ADMIN_USER o ADMIN_PASSWORD no están configuradas.");
      return { error: 'Error de configuración del servidor.' };
    }

    // 2. Validar credenciales
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

      console.log("Login exitoso, redirigiendo...");
    } else {
      console.log("Credenciales incorrectas");
      return { error: 'Credenciales incorrectas. Intenta de nuevo.' };
    }
  } catch (error: unknown) {
    if ((error as { message: string }).message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error("Error en login action:", error);
    return { error: 'Ocurrió un error inesperado al iniciar sesión.' };
  }

  // Redirect must be outside try/catch or re-thrown if inside
  redirect('/admin');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect('/login');
}