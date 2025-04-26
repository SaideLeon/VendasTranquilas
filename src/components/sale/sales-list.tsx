"use client";

import React, { useState } from 'react';
import type { Sale } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowDownCircle, ArrowUpCircle, AlertTriangle, PackageX, ShoppingCart } from "lucide-react"; // Import ShoppingCart
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface SalesListProps {
  sales: Sale[];
  onDelete: (saleId: string) => void;
}

export default function SalesList({ sales, onDelete }: SalesListProps) {
   const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

   const formatDate = (dateString: string) => {
      try {
         return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
      } catch (e) {
          return "Data inválida";
      }
  };

    const handleDeleteClick = (sale: Sale) => {
      setSaleToDelete(sale);
  };

   const confirmDelete = () => {
     if (saleToDelete) {
       onDelete(saleToDelete.id);
       setSaleToDelete(null); // Close dialog
     }
   };

  // Sort sales by date, newest first
  const sortedSales = [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
     <Card>
         <CardHeader>
             <CardTitle className="flex items-center gap-2">
                 <ShoppingCart className="h-5 w-5 text-primary-foreground"/>
                 Histórico de Vendas / Perdas ({sales.length})
             </CardTitle>
         </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] rounded-md border"> {/* Adjust height as needed */}
                <Table>
                <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd.</TableHead>
                    <TableHead className="text-right">Valor Venda</TableHead>
                    <TableHead className="text-right">Lucro / Prejuízo</TableHead>
                    <TableHead className="hidden md:table-cell">Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                 <TooltipProvider>
                    <TableBody>
                        {sortedSales.length > 0 ? (
                        sortedSales.map((sale) => (
                            <TableRow key={sale.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                                 {sale.productName}
                                 {sale.isLoss && (
                                     <Tooltip>
                                         <TooltipTrigger>
                                             <Badge variant="destructive" className="cursor-help">
                                                <AlertTriangle className="h-3 w-3 mr-1"/> Perda
                                             </Badge>
                                         </TooltipTrigger>
                                         <TooltipContent>
                                            <p className="text-sm">Motivo: {sale.lossReason || 'Não especificado'}</p>
                                         </TooltipContent>
                                     </Tooltip>
                                 )}
                             </TableCell>
                            <TableCell className="text-right">{sale.quantitySold}</TableCell>
                            <TableCell className="text-right">{formatCurrency(sale.saleValue)}</TableCell>
                            <TableCell className={`text-right font-semibold ${sale.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <span className="inline-flex items-center gap-1">
                                 {sale.profit >= 0 ? <ArrowUpCircle className="h-4 w-4"/> : <ArrowDownCircle className="h-4 w-4"/>}
                                 {formatCurrency(sale.profit)}
                                </span>
                            </TableCell>
                             <TableCell className="hidden md:table-cell">{formatDate(sale.createdAt)}</TableCell>
                            <TableCell className="text-right">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(sale)} aria-label={`Excluir registro de ${sale.productName}`}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tem certeza que deseja excluir este registro de {sale.isLoss ? 'perda' : 'venda'} para "{saleToDelete?.productName}"? A quantidade em estoque será ajustada de volta. Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setSaleToDelete(null)}>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                                 <div className="flex flex-col items-center justify-center gap-2">
                                     <PackageX className="h-8 w-8 text-muted-foreground"/>
                                     <p className="text-muted-foreground">Nenhuma venda ou perda registrada.</p>
                                 </div>
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                 </TooltipProvider>
                </Table>
            </ScrollArea>
          </CardContent>
    </Card>
  );
}
