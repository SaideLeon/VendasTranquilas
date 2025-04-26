// src/components/sale/sale-details-modal.tsx
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
import type { Sale, Product } from "@/types";
import { calculateUnitCost } from "@/types";
import { useStore } from "@/store/store";
import { formatCurrency } from "@/lib/currency-utils";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShoppingCart, Package, DollarSign, Calendar, Hash, TrendingUp, TrendingDown, AlertTriangle, Info, MessageSquare } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

interface SaleDetailsModalProps {
  sale: Sale | null;
  product: Product | undefined; // Pass the related product
  isOpen: boolean;
  onClose: () => void;
}

export default function SaleDetailsModal({ sale, product, isOpen, onClose }: SaleDetailsModalProps) {
  const { currency } = useStore();

  if (!sale) return null;

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

  // Calculate unit cost at the time of sale (using the related product passed in)
  const { cost: unitCost, error: unitCostError } = calculateUnitCost(product);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {sale.isLoss ? <AlertTriangle className="h-5 w-5 text-destructive"/> : <ShoppingCart className="h-5 w-5 text-green-600"/>}
            Detalhes da {sale.isLoss ? 'Perda' : 'Venda'}
          </DialogTitle>
          <DialogDescription>
            Registro de transação para "{sale.productName}".
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-10rem)] pr-4">
          <div className="grid gap-3 py-4">
            {/* Product Info */}
            <div className="flex items-center gap-2 border-b pb-2">
              <Package className="h-4 w-4 text-muted-foreground"/>
              <span className="text-sm font-medium text-muted-foreground">Produto:</span>
              <span className="font-semibold">{sale.productName}</span>
              {sale.isLoss && <Badge variant="destructive">Perda</Badge>}
            </div>

            {/* Transaction Details */}
            <div className="flex items-center gap-2">
               <Calendar className="h-4 w-4 text-muted-foreground"/>
               <span className="text-sm font-medium text-muted-foreground">Data:</span>
               <span>{formatDate(sale.createdAt)}</span>
            </div>
             <div className="flex items-center gap-2">
                 <Hash className="h-4 w-4 text-muted-foreground"/>
                 <span className="text-sm font-medium text-muted-foreground">Quantidade:</span>
                 <span>{sale.quantitySold} unidade(s)</span>
            </div>

             <Separator className="my-1"/>

            {/* Financial Details */}
             <div className="flex items-center gap-2">
               <DollarSign className="h-4 w-4 text-muted-foreground"/>
               <span className="text-sm font-medium text-muted-foreground">Custo Unitário (na época):</span>
               <span>
                   {unitCostError ? <span className="text-destructive">{unitCostError}</span> : formatValue(unitCost)}
               </span>
            </div>
             <div className="flex items-center gap-2">
               <DollarSign className="h-4 w-4 text-muted-foreground"/>
               <span className="text-sm font-medium text-muted-foreground">Valor Total da Venda:</span>
               <span>{formatValue(sale.saleValue)}</span>
            </div>
             <div className="flex items-center gap-2">
                 {sale.profit >= 0 ? <TrendingUp className="h-4 w-4 text-green-600"/> : <TrendingDown className="h-4 w-4 text-red-600"/>}
                 <span className="text-sm font-medium text-muted-foreground">Lucro / Prejuízo:</span>
                 <span className={`font-semibold ${sale.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatValue(sale.profit)}
                 </span>
            </div>

            {/* Loss Reason */}
            {sale.isLoss && sale.lossReason && (
               <>
                <Separator className="my-1"/>
                <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5"/>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground">Motivo da Perda:</span>
                        <p className="text-sm">{sale.lossReason}</p>
                    </div>
               </div>
               </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
