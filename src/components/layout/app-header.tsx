// src/components/layout/app-header.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { Package, ShoppingCart, BarChart3, Wifi, WifiOff, Cloud, Upload, Download, Landmark, HandCoins, BrainCircuit } from "lucide-react"; // Added HandCoins for Debts, BrainCircuit for Insights
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
import { handleExport, handleImport } from '@/lib/data-utils';
import { useToast } from "@/hooks/use-toast";
import React, { useRef } from "react";
import { SUPPORTED_CURRENCIES, getCurrencyConfig } from "@/config/currencies";
import { Database } from 'lucide-react';


export default function AppHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  // Added setDebts to the destructuring
  const { isOnline, syncData, lastSync, setProducts, setSales, setDebts, setLastSync, currency, setCurrency, isDatabaseConnected } = useStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getActiveTab = () => {
    if (pathname.startsWith("/produtos")) return "produtos";
    if (pathname.startsWith("/vendas")) return "vendas";
    if (pathname.startsWith("/dividas")) return "dividas";
    if (pathname.startsWith("/relatorios")) return "relatorios";
    if (pathname.startsWith("/insights")) return "insights"; // Added insights tab
    return "";
  };

   const onImportClick = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Pass setDebts to handleImport
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
       // Reset file input to allow importing the same file again
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
             description: "Seu backup foi baixado como 'vendas_tranquilas_backup.json'.",
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
                <p>Sistema Interativo de Gestão Financeira</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Desktop Navigation */}
          <Tabs value={getActiveTab()} className="hidden md:block">
            <TabsList>
              <TabsTrigger value="produtos" asChild>
                <Link href="/produtos">
                  <Package className="mr-2 h-4 w-4" /> Produtos
                </Link>
              </TabsTrigger>
              <TabsTrigger value="vendas" asChild>
                <Link href="/vendas">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Vendas
                </Link>
              </TabsTrigger>
               {/* Debts Tab */}
               <TabsTrigger value="dividas" asChild>
                <Link href="/dividas">
                  <HandCoins className="mr-2 h-4 w-4" /> Dívidas
                </Link>
              </TabsTrigger>
              <TabsTrigger value="relatorios" asChild>
                <Link href="/relatorios">
                  <BarChart3 className="mr-2 h-4 w-4" /> Relatórios
                </Link>
              </TabsTrigger>
               {/* Insights Tab */}
               <TabsTrigger value="insights" asChild>
                <Link href="/insights">
                  <BrainCircuit className="mr-2 h-4 w-4" /> Insights AI
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 md:gap-3">
           {/* Currency Selector Dropdown */}
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
                  <TooltipContent>
                      <p>Selecionar Moeda ({currency})</p>
                  </TooltipContent>
              </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end" className="w-56">
                 <DropdownMenuLabel>Moeda da Aplicação</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 <DropdownMenuRadioGroup value={currency} onValueChange={handleCurrencyChange}>
                    {SUPPORTED_CURRENCIES.map((curr) => (
                       <DropdownMenuRadioItem key={curr.code} value={curr.code}>
                          {curr.code} ({curr.symbol})
                       </DropdownMenuRadioItem>
                    ))}
                 </DropdownMenuRadioGroup>
              </DropdownMenuContent>
           </DropdownMenu>

           {/* Import/Export Dropdown */}
           <DropdownMenu>
            <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                     <Button variant="outline" size="icon">
                         <Cloud className="h-4 w-4" />
                         <span className="sr-only">Importar/Exportar Dados</span>
                    </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Importar / Exportar</p>
              </TooltipContent>
            </Tooltip>
           </TooltipProvider>
            <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={onImportClick}>
                  <Download className="mr-2 h-4 w-4" />
                  Importar de JSON
              </DropdownMenuItem>
               <DropdownMenuItem onClick={onExportClick}>
                  <Upload className="mr-2 h-4 w-4" />
                 Exportar para JSON
               </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            style={{ display: 'none' }}
            onChange={onFileSelected}
           />

           {/* Database Status Indicator */}
           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 <Button variant="ghost" size="icon">
                   {isDatabaseConnected ? <Database className="h-5 w-5 text-green-600" /> : <Database className="h-5 w-5 text-red-600 rotate-45" />}
                   <span className="sr-only">{isDatabaseConnected ? "Conectado" : "Desconectado"}</span>
                 </Button>
               </TooltipTrigger>
               <TooltipContent>
                 <p>{isDatabaseConnected ? "Banco de dados conectado" : "Banco de dados desconectado"}</p>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>

           {/* Online Status Indicator */}
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
                 {isOnline && lastSync && (
                     <p className="text-xs text-muted-foreground">
                         Última sinc.: {formatDistanceToNow(lastSync, { addSuffix: true, locale: ptBR })}
                    </p>
                 )}
                 {isOnline && !lastSync && (
                     <p className="text-xs text-muted-foreground">
                         Sincronização pendente.
                    </p>
                 )}
                 {!isOnline && (
                    <p className="text-xs text-muted-foreground">Dados serão sincronizados ao conectar.</p>
                 )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? ''} />
                    <AvatarFallback>{session.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => signIn()}>Entrar</Button>
          )}
        </div>
      </div>
       {/* Mobile Navigation */}
      <div className="md:hidden border-t">
         <Tabs value={getActiveTab()} className="w-full p-1">
            {/* Adjusted grid columns for 5 tabs */}
            <TabsList className="grid w-full grid-cols-5 h-12">
              <TabsTrigger value="produtos" asChild className="h-full">
                <Link href="/produtos" className="flex flex-col items-center justify-center text-xs gap-1">
                  <Package className="h-4 w-4" /> Produtos
                </Link>
              </TabsTrigger>
              <TabsTrigger value="vendas" asChild className="h-full">
                <Link href="/vendas" className="flex flex-col items-center justify-center text-xs gap-1">
                  <ShoppingCart className="h-4 w-4" /> Vendas
                </Link>
              </TabsTrigger>
               {/* Mobile Debts Tab */}
               <TabsTrigger value="dividas" asChild className="h-full">
                <Link href="/dividas" className="flex flex-col items-center justify-center text-xs gap-1">
                  <HandCoins className="h-4 w-4" /> Dívidas
                </Link>
              </TabsTrigger>
              <TabsTrigger value="relatorios" asChild className="h-full">
                <Link href="/relatorios" className="flex flex-col items-center justify-center text-xs gap-1">
                  <BarChart3 className="h-4 w-4" /> Relatórios
                </Link>
              </TabsTrigger>
               {/* Mobile Insights Tab */}
               <TabsTrigger value="insights" asChild className="h-full">
                <Link href="/insights" className="flex flex-col items-center justify-center text-xs gap-1">
                  <BrainCircuit className="h-4 w-4" /> Insights
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
      </div>
    </header>
  );
}