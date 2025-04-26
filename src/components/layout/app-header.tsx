"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingCart, BarChart3, Wifi, WifiOff, Cloud, Upload, Download } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { handleExport, handleImport } from '@/lib/data-utils';
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";


export default function AppHeader() {
  const pathname = usePathname();
  const { isOnline, syncData, lastSync, setProducts, setSales, setLastSync } = useStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getActiveTab = () => {
    if (pathname.startsWith("/produtos")) return "produtos";
    if (pathname.startsWith("/vendas")) return "vendas";
    if (pathname.startsWith("/relatorios")) return "relatorios";
    return "";
  };

   const onImportClick = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await handleImport(file, setProducts, setSales, setLastSync);
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


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-primary-foreground mr-6">Vendas Tranquilas</h1>
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
              <TabsTrigger value="relatorios" asChild>
                <Link href="/relatorios">
                  <BarChart3 className="mr-2 h-4 w-4" /> Relatórios
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-3">
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
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
       {/* Mobile Navigation */}
      <div className="md:hidden border-t">
         <Tabs value={getActiveTab()} className="w-full p-1">
            <TabsList className="grid w-full grid-cols-3 h-12">
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
              <TabsTrigger value="relatorios" asChild className="h-full">
                <Link href="/relatorios" className="flex flex-col items-center justify-center text-xs gap-1">
                  <BarChart3 className="h-4 w-4" /> Relatórios
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
      </div>
    </header>
  );
}
