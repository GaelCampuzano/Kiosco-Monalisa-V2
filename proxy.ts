import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'monalisa_admin_session';

export function middleware(req: NextRequest) {
  // Interceptamos solo la ruta /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const authCookie = req.cookies.get(COOKIE_NAME);

    // Si no tiene la cookie correcta, mandarlo al login
    if (!authCookie || authCookie.value !== 'authenticated') {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};