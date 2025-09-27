'use client';

import { 
  SidebarInset,
} from "@/components/ui/sidebar"; 

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return ( 
      <SidebarInset>{children}</SidebarInset> 
  );
}