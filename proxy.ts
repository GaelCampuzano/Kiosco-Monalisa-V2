import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'monalisa_admin_session';

// CAMBIO CLAVE: Cambiamos a 'export default function proxy' para cumplir con la nueva convención
export default function proxy(req: NextRequest) {
  const authCookie = req.cookies.get(COOKIE_NAME);

  // El 'matcher' en la configuración se asegura de que este código solo se ejecute para /admin
  // Si no tiene la cookie correcta, mandarlo al login
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