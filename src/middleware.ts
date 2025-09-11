import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const { token } = request.nextauth;
    const { pathname } = request.nextUrl;

    // If user is logged in and tries to access /login, redirect them
    if (token && pathname === '/login') {
        return NextResponse.redirect(new URL('/produtos', request.url));
    }

    // If user is trying to access admin routes
    const isAdminRoute = pathname.startsWith('/admin');
    if (isAdminRoute && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/produtos', request.url));
    }

    // If no redirection is needed, continue to the requested page
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname === '/login') {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/login',
    '/produtos',
    '/produtos/:path*',
    '/vendas',
    '/vendas/:path*',
    '/dividas',
    '/dividas/:path*',
    '/relatorios',
    '/relatorios/:path*',
    '/insights',
    '/insights/:path*',
    '/admin',
    '/admin/:path*',
  ],
};