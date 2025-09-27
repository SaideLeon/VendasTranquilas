// src/components/sale/sales-list.tsx
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
import { Trash2, ArrowDownCircle, ArrowUpCircle, AlertTriangle, PackageX, ShoppingCart, Eye } from "lucide-react"; // Added Eye
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStore } from '@/store/store';
import { formatCurrency } from '@/lib/currency-utils';

interface SalesListProps {
  sales: Sale[];
  onDelete: (saleId: string) => void;
  onViewDetails: (sale: Sale) => void; // Added prop for viewing details
}

export default function SalesList({ sales, onDelete, onViewDetails }: SalesListProps) {
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const { currency } = useStore();

  const formatValue = (value: number) => formatCurrency(value, currency);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  const handleDeleteClick = (sale: Sale) => setSaleToDelete(sale);

  const confirmDelete = () => {
    if (saleToDelete) {
      onDelete(saleToDelete.id);
      setSaleToDelete(null);
    }
  };

  const sortedSales = [...sales].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary-foreground"/>
          Histórico de Vendas / Perdas ({sales.length})
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <TooltipProvider>
            <Table className="min-w-max">
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="min-w-[150px] sticky left-0 bg-background z-20">Produto</TableHead>
                  <TableHead className="text-right min-w-[80px]">Qtd.</TableHead>
                  <TableHead className="text-right min-w-[120px]">Valor Venda</TableHead>
                  <TableHead className="text-right min-w-[150px]">Lucro / Prejuízo</TableHead>
                  <TableHead className="min-w-[150px]">Data</TableHead>
                  <TableHead className="text-right min-w-[140px] sticky right-0 bg-background z-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSales.length > 0 ? (
                  sortedSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium flex items-center gap-2 sticky left-0 bg-background z-10">
                        {sale.productName}
                        {sale.isLoss && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="destructive" className="cursor-help ml-1">
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
                      <TableCell className="text-right">{formatValue(sale.saleValue)}</TableCell>
                      <TableCell className={`text-right font-semibold ${sale.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="inline-flex items-center gap-1">
                          {sale.profit >= 0 ? <ArrowUpCircle className="h-4 w-4"/> : <ArrowDownCircle className="h-4 w-4"/>}
                          {formatValue(sale.profit)}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(sale.createdAt)}</TableCell>
                      <TableCell className="text-right sticky right-0 bg-background z-10 space-x-2">
                        {/* View Details Button */}
                         <Button variant="outline" size="icon" onClick={() => onViewDetails(sale)} aria-label={`Visualizar detalhes de ${sale.productName}`}>
                            <Eye className="h-4 w-4" />
                         </Button>
                         {/* Delete Button */}
                         <AlertDialog>
                           <AlertDialogTitle asChild>
                             <Button
                               variant="destructive" // Changed from ghost for consistency
                               size="icon"
                               onClick={() => handleDeleteClick(sale)}
                               aria-label={`Excluir registro de ${sale.productName}`}
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </AlertDialogTitle>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                               <AlertDialogDescription>
                                 Tem certeza que deseja excluir este registro de {saleToDelete?.isLoss ? 'perda' : 'venda'} para "{saleToDelete?.productName}"? Esta ação restaurará a quantidade no estoque do produto.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel onClick={() => setSaleToDelete(null)}>Cancelar</AlertDialogCancel>
                               <AlertDialogAction
                                 onClick={confirmDelete}
                                 className="bg-destructive hover:bg-destructive/90"
                               >
                                 Excluir
                               </AlertDialogAction>
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
            </Table>
          </TooltipProvider>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}