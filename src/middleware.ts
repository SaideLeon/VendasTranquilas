import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const { token } = request.nextauth;
    const { pathname } = request.nextUrl;

    // Redirecionar usuário logado tentando acessar /login → vai para /produtos
    if (token && pathname === '/login') {
      return NextResponse.redirect(new URL('/produtos', request.url));
    }

    // Proteger rotas de admin
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/produtos', request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // simples: só exige estar logado
    },
    // Deixe o NextAuth usar a página de login normal sem travar o fluxo OAuth
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