import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'monalisa_admin_session';

/**
 * Proxy para proteger las rutas de administración
 * Verifica que el usuario tenga una sesión válida antes de acceder a /admin
 */
export default function proxy(req: NextRequest) {
  const authCookie = req.cookies.get(COOKIE_NAME);

  // Si no tiene la cookie correcta, redirigir al login
  if (!authCookie || authCookie.value !== 'authenticated') {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Continuar con la solicitud
  return NextResponse.next();
}

export const config = {
  // Esto asegura que el proxy solo se ejecuta para /admin y sus subrutas
  matcher: '/admin/:path*',
};

