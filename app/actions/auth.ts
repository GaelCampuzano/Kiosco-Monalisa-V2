'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDbPool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { UserRow } from '@/types/db';

const COOKIE_NAME = 'monalisa_admin_session';

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

    // 1. Validar contra la base de datos
    const pool = await getDbPool();
    const [rows] = await pool.query<UserRow[]>('SELECT * FROM users WHERE username = ? LIMIT 1', [
      user,
    ]);

    if (rows.length === 0) {
      console.log('Login fallido: Usuario no encontrado');
      return { error: 'El usuario o la contraseña son incorrectos.', code: 'INVALID_CREDENTIALS' };
    }

    const dbUser = rows[0];

    // 2. Verificar contraseña con bcrypt
    const passwordMatch = await bcrypt.compare(password, dbUser.password_hash);

    if (passwordMatch) {
      const cookieStore = await cookies();

      // Crear cookie de sesión por 24 horas
      // Podríamos guardar el ID de usuario en la cookie si quisiéramos sesiones más complejas
      cookieStore.set(COOKIE_NAME, 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      console.log(`Login exitoso para usuario: ${user}`);
    } else {
      console.log('Login fallido: Contraseña incorrecta');
      return { error: 'El usuario o la contraseña son incorrectos.', code: 'INVALID_CREDENTIALS' };
    }
  } catch (error: unknown) {
    if ((error as { message: string }).message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Error en login action:', error);
    return {
      error: 'Ocurrió un error inesperado al iniciar sesión. Intenta más tarde.',
      code: 'SERVER_ERROR',
    };
  }

  // Redirect must be outside try/catch or re-thrown if inside
  redirect('/admin');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect('/login');
}
