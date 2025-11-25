import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'monalisa_admin_session';

export function proxy(req: NextRequest) {
  // 1. Obtener la cookie de sesión
  const authCookie = req.cookies.get(COOKIE_NAME);

  // 2. Comprobar la autenticación
  if (!authCookie || authCookie.value !== 'authenticated') {
    // Redirigir si no está autenticado
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Continuar si está autenticado
  return NextResponse.next();
}

export const config = {
  // Asegura que el proxy solo se ejecute para /admin y sus subrutas
  matcher: '/admin/:path*',
};