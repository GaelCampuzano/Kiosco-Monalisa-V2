import { cookies } from 'next/headers';

/**
 * Verifica si la sesión actual del administrador es válida.
 *
 * @returns {Promise<boolean>} Verdadero si la cookie de sesión existe y es correcta.
 */
export async function verifySession() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('monalisa_admin_session');

  if (!authCookie || authCookie.value !== 'authenticated') {
    return false;
  }
  return true;
}

/**
 * Middleware interno para rutas protegidas o Server Actions.
 * Lanza un error si la sesión no está autenticada.
 *
 * @throws {Error} Si el usuario no tiene una sesión válida.
 */
export async function requireAuth() {
  const isAuth = await verifySession();
  if (!isAuth) {
    throw new Error('No autorizado');
  }
}
