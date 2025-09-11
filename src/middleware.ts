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
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // If they are trying to access /login, let them pass to the middleware.
        // The middleware will redirect them if they are already logged in.
        if (req.nextUrl.pathname === '/login') {
          return true;
        }
        // For any other matched route, they must be logged in.
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
    '/produtos/:path*',
    '/vendas/:path*',
    '/dividas/:path*',
    '/relatorios/:path*',
    '/insights/:path*',
    '/admin/:path*',
  ],
};
