import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Nombre de la cookie de sesión que buscamos
const COOKIE_NAME = 'monalisa_admin_session';

/**
 * Middleware de seguridad global para rutas administrativas.
 * Se ejecuta ANTES de que la petición llegue a la página o API.
 *
 * @param req - La petición entrante (NextRequest).
 * @returns Respuesta de Next.js (continuar o redirigir).
 *
 * FUNCIONALIDAD:
 * 1. Intercepta peticiones a rutas definidas en `config.matcher` (/admin/*).
 * 2. Verifica la existencia y valor de la cookie de sesión.
 * 3. Si no es válida, redirige al usuario a /login.
 */
export function proxy(req: NextRequest) {
  // Obtenemos la cookie de sesión
  const authCookie = req.cookies.get(COOKIE_NAME);

  // Si no existe la cookie o su valor no es 'authenticated', redirigir al login.
  if (!authCookie || authCookie.value !== 'authenticated') {
    const loginUrl = new URL('/login', req.url);
    // Agregamos un parámetro para saber de dónde venía el usuario (opcional)
    loginUrl.searchParams.set('from', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si todo está bien, permitimos que la petición continúe
  return NextResponse.next();
}

/**
 * Configuración del Middleware.
 * Define qué rutas deben ser protegidas por esta función.
 */
export const config = {
  matcher: '/admin/:path*',
};
