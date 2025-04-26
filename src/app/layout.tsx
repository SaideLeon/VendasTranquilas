import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import AppHeader from "@/components/layout/app-header";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Vendas Tranquilas",
  description: "Gerenciamento de produtos e vendas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          <main className="flex-1 container mx-auto p-4 md:p-8">
             {children}
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
