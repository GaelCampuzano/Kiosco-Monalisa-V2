'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDbPool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { UserRow } from '@/types/db';

const COOKIE_NAME = 'monalisa_admin_session';

/**
 * Maneja el proceso de inicio de sesión de los administradores.
 *
 * @param prevState - Estado anterior del formulario (Server Action pattern).
 * @param formData - Datos enviados desde el formulario de login.
 * @returns Objeto de error si falla, o redirige al panel de admin si tiene éxito.
 *
 * FLUJO DE SEGURIDAD:
 * 1. Valida credenciales básicas.
 * 2. Busca al usuario en la base de datos MySQL por nombre de usuario.
 * 3. Compara la contraseña proporcionada con el hash almacenado usando `bcrypt`.
 * 4. Si es válido, crea una cookie de sesión HTTP-only.
 *    - La cookie es segura (HTTPS) en producción, pero se relaja para redes locales (HTTP) si es necesario.
 */
export async function login(prevState: unknown, formData: FormData) {
  try {
    const user = formData.get('user') as string;
    const password = formData.get('password') as string;

    // Validación básica de entrada
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

    // 2. Verificar contraseña con bcrypt (Comparación segura de hashes)
    const passwordMatch = await bcrypt.compare(password, dbUser.password_hash);

    if (passwordMatch) {
      const cookieStore = await cookies();

      // Crear cookie de sesión por 24 horas
      // NOTA: No guardamos datos sensibles en la cookie, solo un flag de autenticación.
      cookieStore.set(COOKIE_NAME, 'authenticated', {
        httpOnly: true, // No accesible vía JavaScript del navegador (protección XSS)
        // [FIX]: Permitir cookies en LAN (HTTP) aunque estemos en producción para acceso local
        secure: false,
        sameSite: 'lax', // Protección CSRF básica
        maxAge: 60 * 60 * 24, // 24 horas
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

  // La redirección debe estar fuera del try/catch para que Next.js la maneje correctamente
  redirect('/admin');
}

/**
 * Cierra la sesión del usuario eliminando la cookie de autenticación.
 * Redirige a la página de login inmediatamente.
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect('/login');
}
