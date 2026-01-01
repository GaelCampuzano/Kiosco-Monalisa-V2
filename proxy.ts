import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'monalisa_admin_session';

/**
 * Proxy para proteger las rutas de administración.
 * Verifica que el usuario tenga una sesión válida utilizando una cookie antes de permitir el acceso a /admin.
 */
export default function proxy(req: NextRequest) {
  const authCookie = req.cookies.get(COOKIE_NAME);

  // Si no existe la cookie o su valor no es el esperado, redirigir al inicio de sesión.
  if (!authCookie || authCookie.value !== 'authenticated') {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si la autenticación es correcta, continuar con la solicitud.
  return NextResponse.next();
}

export const config = {
  // Asegura que este middleware solo se ejecute para rutas bajo /admin.
  matcher: '/admin/:path*',
};

