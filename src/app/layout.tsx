import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AppSessionProvider from "@/components/layout/session-provider";
import AppLayout from '@/components/layout/app-layout';
import React, { useEffect } from 'react';


const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SIGEF - Sistema Intuitivo de Gestão Financeira",
  description: "Sistema Intuitivo de Gestão Financeira",
  manifest: "/manifest.json",
  icons: {
    icon: '/logo.svg',
    apple: '/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('Service Worker registrado com sucesso:', registration.scope);
        }).catch(error => {
          console.log('Falha ao registrar o Service Worker:', error);
        });
      });
    }
  }, []);
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <AppSessionProvider>
          <AppLayout>{children}</AppLayout>
        </AppSessionProvider>
      </body>
    </html>
  );
}
