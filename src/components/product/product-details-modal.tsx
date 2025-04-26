// src/components/product/product-details-modal.tsx
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Product, Sale } from "@/types";
import { calculateUnitCost } from "@/types";
import { useStore } from "@/store/store";
import { formatCurrency } from "@/lib/currency-utils";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Package, DollarSign, Calendar, ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, ShoppingCart, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
  const { sales, currency } = useStore();

  if (!product) return null;

  const { cost: unitCost, error: unitCostError } = calculateUnitCost(product);

  const formatValue = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return "N/A";
    return formatCurrency(value, currency);
  };

   const formatDate = (dateString: string) => {
      try {
         return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
      } catch (e) {
          return "Data inválida";
      }
  };

  const productSales = sales.filter(sale => sale.productId === product.id)
                             .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort newest first

  const totalSoldQuantity = productSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
  const totalRevenueFromProduct = productSales.filter(s => !s.isLoss).reduce((sum, sale) => sum + sale.saleValue, 0);
  const totalProfitFromProduct = productSales.reduce((sum, sale) => sum + sale.profit, 0); // Sum of profits (losses are negative profit)
  const totalLossQuantity = productSales.filter(s => s.isLoss).reduce((sum, sale) => sum + sale.quantitySold, 0);
  const totalLossValueFromProduct = productSales.filter(s => s.isLoss).reduce((sum, sale) => sum + Math.abs(sale.profit), 0); // Sum of absolute loss values


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]"> {/* Increased max-width and set max-height */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <Package className="h-5 w-5 text-primary-foreground"/> Detalhes do Produto
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre "{product.name}".
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-10rem)] pr-4"> {/* Added ScrollArea */}
            <div className="grid gap-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-3 items-center gap-4 border-b pb-2">
                <span className="text-sm font-medium text-muted-foreground col-span-1">Nome</span>
                <span className="col-span-2 font-semibold">{product.name}</span>
            </div>
             <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground col-span-1 flex items-center gap-1"><Calendar className="h-4 w-4"/> Cadastrado em</span>
                <span className="col-span-2">{formatDate(product.createdAt)}</span>
             </div>

            {/* Stock & Cost Info */}
            <Separator className="my-2"/>
            <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground col-span-1 flex items-center gap-1"><DollarSign className="h-4 w-4"/> Valor Aquisição Total</span>
                <span className="col-span-2">{formatValue(product.acquisitionValue)}</span>
             </div>
             <div className="grid grid-cols-3 items-center gap-4">
                 <span className="text-sm font-medium text-muted-foreground col-span-1">Qtd. Inicial</span>
                 <span className="col-span-2">{product.initialQuantity ?? 'N/A'}</span>
             </div>
            <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground col-span-1 flex items-center gap-1"><DollarSign className="h-4 w-4"/> Custo Unitário</span>
                <span className="col-span-2">
                 {unitCostError ? <span className="text-destructive">{unitCostError}</span> : formatValue(unitCost)}
                </span>
            </div>
             <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground col-span-1">Qtd. Estoque Atual</span>
                <span className={`col-span-2 font-semibold ${product.quantity <= 0 ? 'text-destructive' : ''}`}>
                    {product.quantity}
                 </span>
             </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground col-span-1 flex items-center gap-1"><DollarSign className="h-4 w-4"/> Valor Estoque Atual</span>
                <span className="col-span-2">{formatValue(unitCost * product.quantity)}</span>
             </div>

              {/* Sales & Loss Summary */}
              <Separator className="my-2"/>
              <h4 className="text-md font-semibold mb-2">Resumo de Vendas e Perdas</h4>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground col-span-1 flex items-center gap-1"><ShoppingCart className="h-4 w-4"/> Total Unid. Vendidas</span>
                <span className="col-span-2">{productSales.filter(s => !s.isLoss).reduce((sum, sale) => sum + sale.quantitySold, 0)}</span>
             </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground col-span-1 flex items-center gap-1"><TrendingUp className="h-4 w-4"/> Faturamento Total</span>
                <span className="col-span-2 text-green-600">{formatValue(totalRevenueFromProduct)}</span>
             </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground col-span-1 flex items-center gap-1"><AlertTriangle className="h-4 w-4"/> Total Unid. Perdidas</span>
                <span className="col-span-2">{totalLossQuantity}</span>
             </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground col-span-1 flex items-center gap-1"><TrendingDown className="h-4 w-4"/> Prejuízo Total (Perdas)</span>
                <span className="col-span-2 text-red-600">{formatValue(totalLossValueFromProduct)}</span>
             </div>
             <div className="grid grid-cols-3 items-center gap-4">
                 <span className="text-sm font-medium text-muted-foreground col-span-1 flex items-center gap-1">
                    <DollarSign className="h-4 w-4"/> Lucro/Prejuízo Líquido
                 </span>
                 <span className={`col-span-2 font-semibold ${totalProfitFromProduct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                     {formatValue(totalProfitFromProduct)}
                 </span>
             </div>


              {/* Transaction History */}
              <Separator className="my-2"/>
              <h4 className="text-md font-semibold mb-2">Histórico de Transações ({productSales.length})</h4>
              {productSales.length > 0 ? (
                 <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-3 bg-muted/30">
                    {productSales.map(sale => (
                     <div key={sale.id} className="text-xs border-b pb-2 last:border-b-0">
                         <div className="flex justify-between items-center mb-1">
                             <span className="font-medium flex items-center gap-1">
                                 {sale.isLoss ? <AlertTriangle className="h-3 w-3 text-destructive"/> : <ShoppingCart className="h-3 w-3 text-green-600"/>}
                                 {sale.isLoss ? 'Perda' : 'Venda'} - {sale.quantitySold} unid.
                             </span>
                             <span className="text-muted-foreground">{formatDate(sale.createdAt)}</span>
                         </div>
                          <div className="flex justify-between items-center text-muted-foreground">
                             <span>Valor: {sale.isLoss ? '-' : formatValue(sale.saleValue)}</span>
                              <span className={`${sale.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                 {sale.profit >= 0 ? '+' : ''}{formatValue(sale.profit)}
                              </span>
                          </div>
                         {sale.isLoss && sale.lossReason && (
                             <p className="text-xs mt-1 text-destructive/90">Motivo: {sale.lossReason}</p>
                         )}
                     </div>
                    ))}
                 </div>
              ) : (
                 <p className="text-sm text-muted-foreground text-center py-4">Nenhuma transação registrada para este produto.</p>
              )}
            </div>
        </ScrollArea> {/* Close ScrollArea */}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
