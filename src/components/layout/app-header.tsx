// src/components/layout/app-header.tsx
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { Package, ShoppingCart, BarChart3, Wifi, WifiOff, Cloud, Upload, Download, Landmark, HandCoins, BrainCircuit, Shield, LogOut, ReceiptText, Bot, LayoutDashboard, ArrowLeftRight, PiggyBank, AreaChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/store/store";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "@/components/ui/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { handleExport, handleImport } from '@/lib/data-utils';
import { useToast } from "@/hooks/use-toast";
import React, { useRef, useState, useEffect } from "react";
import { SUPPORTED_CURRENCIES, getCurrencyConfig } from "@/config/currencies";
import { useAuth } from '@/hooks/useAuth';

export default function AppHeader() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { isOnline, syncData, lastSync, setProducts, setSales, setDebts, setLastSync, currency, setCurrency } = useStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const getActiveTab = () => {
    if (pathname.startsWith("/dashboard/transactions")) return "transactions";
    if (pathname.startsWith("/dashboard/budgets")) return "budgets";
    if (pathname.startsWith("/dashboard/reports")) return "reports";
    if (pathname.startsWith("/dashboard")) return "dashboard";
    if (pathname.startsWith("/produtos")) return "produtos";
    if (pathname.startsWith("/vendas")) return "vendas";
    if (pathname.startsWith("/dividas")) return "dividas";
    if (pathname.startsWith("/despesas")) return "despesas";
    if (pathname.startsWith("/relatorios")) return "relatorios";
    if (pathname.startsWith("/insights")) return "insights";
    if (pathname.startsWith("/chat")) return "chat";
    return "";
  };

   const onImportClick = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await handleImport(file, setProducts, setSales, setDebts, setLastSync);
      toast({
        title: "Importação Concluída",
        description: "Os dados foram importados com sucesso.",
      });
    } catch (error) {
      console.error("Import failed:", error);
      toast({
        title: "Erro na Importação",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    } finally {
       if (fileInputRef.current) {
         fileInputRef.current.value = '';
       }
    }
  };

  const onExportClick = async () => {
    try {
        await handleExport();
         toast({
             title: "Exportação Concluída",
             description: "Seu backup foi baixado como 'sigef_backup.json'.",
         });
    } catch (error) {
         console.error("Export failed:", error);
         toast({
             title: "Erro na Exportação",
             description: "Não foi possível exportar os dados.",
             variant: "destructive",
         });
    }
};

 const handleCurrencyChange = (value: string) => {
    if (value) {
        setCurrency(value);
        toast({
             title: "Moeda Alterada",
             description: `Moeda definida para ${getCurrencyConfig(value)?.code || value}.`,
        });
    }
 };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4 md:gap-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/" className="text-lg ml-2 font-semibold text-primary-foreground mr-4 whitespace-nowrap">
                   <Logo />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sistema Intuitivo de Gestão Financeira</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ScrollArea className="hidden md:block whitespace-nowrap">
            <Tabs value={getActiveTab()}>
              <TabsList>
                <TabsTrigger value="dashboard" asChild><Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link></TabsTrigger>
                <TabsTrigger value="transactions" asChild><Link href="/dashboard/transactions"><ArrowLeftRight className="mr-2 h-4 w-4" /> Transações</Link></TabsTrigger>
                <TabsTrigger value="budgets" asChild><Link href="/dashboard/budgets"><PiggyBank className="mr-2 h-4 w-4" /> Orçamentos</Link></TabsTrigger>
                <TabsTrigger value="reports" asChild><Link href="/dashboard/reports"><AreaChart className="mr-2 h-4 w-4" /> Relatórios</Link></TabsTrigger>
                <TabsTrigger value="produtos" asChild><Link href="/produtos"><Package className="mr-2 h-4 w-4" /> Produtos</Link></TabsTrigger>
                <TabsTrigger value="vendas" asChild><Link href="/vendas"><ShoppingCart className="mr-2 h-4 w-4" /> Vendas</Link></TabsTrigger>
                <TabsTrigger value="dividas" asChild><Link href="/dividas"><HandCoins className="mr-2 h-4 w-4" /> Dívidas</Link></TabsTrigger>
                <TabsTrigger value="relatorios" asChild><Link href="/relatorios"><BarChart3 className="mr-2 h-4 w-4" /> Relatórios</Link></TabsTrigger>
                <TabsTrigger value="insights" asChild><Link href="/insights"><BrainCircuit className="mr-2 h-4 w-4" /> Insights AI</Link></TabsTrigger>
                <TabsTrigger value="chat" asChild><Link href="/chat"><Bot className="mr-2 h-4 w-4" /> Chat AI</Link></TabsTrigger>
              </TabsList>
            </Tabs>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
           <DropdownMenu>
              <TooltipProvider>
              <Tooltip>
                  <TooltipTrigger asChild>
                     <DropdownMenuTrigger asChild>
                       <Button variant="outline" size="icon" className="relative">
                         <Landmark className="h-4 w-4" />
                         <span className="absolute -top-1 -right-1 text-xs font-bold text-muted-foreground bg-background rounded-full px-0.5">
                            {getCurrencyConfig(currency)?.symbol || currency}
                         </span>
                         <span className="sr-only">Selecionar Moeda</span>
                       </Button>
                     </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent><p>Selecionar Moeda ({currency})</p></TooltipContent>
              </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end" className="w-56">
                 <DropdownMenuLabel>Moeda da Aplicação</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 <DropdownMenuRadioGroup value={currency} onValueChange={handleCurrencyChange}>
                    {SUPPORTED_CURRENCIES.map((curr) => (
                       <DropdownMenuRadioItem key={curr.code} value={curr.code}>{curr.code} ({curr.symbol})</DropdownMenuRadioItem>
                    ))}
                 </DropdownMenuRadioGroup>
              </DropdownMenuContent>
           </DropdownMenu>

           <DropdownMenu>
            <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                     <Button variant="outline" size="icon"><Cloud className="h-4 w-4" /><span className="sr-only">Importar/Exportar Dados</span></Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Importar / Exportar</p></TooltipContent>
            </Tooltip>
           </TooltipProvider>
            <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={onImportClick}><Download className="mr-2 h-4 w-4" />Importar de JSON</DropdownMenuItem>
               <DropdownMenuItem onClick={onExportClick}><Upload className="mr-2 h-4 w-4" />Exportar para JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <input type="file" ref={fileInputRef} accept=".json" style={{ display: 'none' }} onChange={onFileSelected} />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={syncData} disabled={!isOnline}>
                  {isOnline ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-red-600" />}
                  <span className="sr-only">{isOnline ? "Online" : "Offline"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isOnline ? "Online" : "Offline"}</p>
                 {isOnline && lastSync && (<p className="text-xs text-muted-foreground">Última sinc.: {formatDistanceToNow(lastSync, { addSuffix: true, locale: ptBR })}</p>)}
                 {isOnline && !lastSync && (<p className="text-xs text-muted-foreground">Sincronização pendente.</p>)}
                 {!isOnline && (<p className="text-xs text-muted-foreground">Dados serão sincronizados ao conectar.</p>)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin"><Shield className="mr-2 h-4 w-4" />Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => router.push("/login")}>Entrar</Button>
          )}
        </div>
      </div>
      <div className="md:hidden border-t">
        <ScrollArea className="w-full whitespace-nowrap">
          <Tabs value={getActiveTab()} className="p-1">
            <TabsList className="h-12">
              <TabsTrigger value="dashboard" asChild className="h-full"><Link href="/dashboard" className="flex flex-col items-center justify-center text-xs gap-1 w-20"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link></TabsTrigger>
              <TabsTrigger value="transactions" asChild className="h-full"><Link href="/dashboard/transactions" className="flex flex-col items-center justify-center text-xs gap-1 w-20"><ArrowLeftRight className="h-4 w-4" /> Transações</Link></TabsTrigger>
              <TabsTrigger value="budgets" asChild className="h-full"><Link href="/dashboard/budgets" className="flex flex-col items-center justify-center text-xs gap-1 w-20"><PiggyBank className="h-4 w-4" /> Orçamentos</Link></TabsTrigger>
              <TabsTrigger value="reports" asChild className="h-full"><Link href="/dashboard/reports" className="flex flex-col items-center justify-center text-xs gap-1 w-20"><AreaChart className="h-4 w-4" /> Relatórios</Link></TabsTrigger>
              <TabsTrigger value="produtos" asChild className="h-full"><Link href="/produtos" className="flex flex-col items-center justify-center text-xs gap-1 w-20"><Package className="h-4 w-4" /> Produtos</Link></TabsTrigger>
              <TabsTrigger value="vendas" asChild className="h-full"><Link href="/vendas" className="flex flex-col items-center justify-center text-xs gap-1 w-20"><ShoppingCart className="h-4 w-4" /> Vendas</Link></TabsTrigger>
              <TabsTrigger value="dividas" asChild className="h-full"><Link href="/dividas" className="flex flex-col items-center justify-center text-xs gap-1 w-20"><HandCoins className="h-4 w-4" /> Dívidas</Link></TabsTrigger>
              <TabsTrigger value="relatorios" asChild className="h-full"><Link href="/relatorios" className="flex flex-col items-center justify-center text-xs gap-1 w-20"><BarChart3 className="h-4 w-4" /> Relatórios</Link></TabsTrigger>
              <TabsTrigger value="insights" asChild className="h-full"><Link href="/insights" className="flex flex-col items-center justify-center text-xs gap-1 w-20"><BrainCircuit className="h-4 w-4" /> Insights</Link></TabsTrigger>
              <TabsTrigger value="chat" asChild className="h-full"><Link href="/chat" className="flex flex-col items-center justify-center text-xs gap-1 w-20"><Bot className="h-4 w-4" /> Chat</Link></TabsTrigger>
            </TabsList>
          </Tabs>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </header>
  );
}
