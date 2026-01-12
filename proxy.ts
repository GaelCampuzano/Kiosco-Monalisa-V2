import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'monalisa_admin_session';

/**
 * Middleware (ahora Proxy) para proteger las rutas de administración.
 * Verifica que el usuario tenga una sesión válida (cookie) antes de permitir el acceso a /admin.
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

    // Si la autenticación es correcta, permitir el acceso.
    return NextResponse.next();
}

// Configuración del middleware
export const config = {
    // Aplicar solo a las rutas que empiecen con /admin
    matcher: '/admin/:path*',
};
