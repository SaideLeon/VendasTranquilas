// src/components/debt/debt-details-modal.tsx
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
import type { Debt, DebtStatus } from "@/types";
import { useStore } from "@/store/store";
import { formatCurrency } from "@/lib/currency-utils";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HandCoins, Calendar, Hash, DollarSign, User, Link as LinkIcon, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react'; // Import relevant icons
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from "@/components/ui/progress"; // Import Progress

interface DebtDetailsModalProps {
  debt: Debt | null;
  isOpen: boolean;
  onClose: () => void;
}

// Helper to get status display properties (copied from DebtList for consistency)
const getStatusProps = (status: DebtStatus): { text: string; color: string; icon: React.ElementType } => {
    switch (status) {
        case 'paid':
            return { text: 'Pago', color: 'text-green-600 bg-green-100 border-green-300', icon: CheckCircle };
        case 'partially_paid':
            return { text: 'Parcialmente Pago', color: 'text-yellow-600 bg-yellow-100 border-yellow-300', icon: Clock };
        case 'pending':
        default:
            return { text: 'Pendente', color: 'text-red-600 bg-red-100 border-red-300', icon: XCircle };
    }
};

export default function DebtDetailsModal({ debt, isOpen, onClose }: DebtDetailsModalProps) {
  const { currency, getSaleById } = useStore(state => ({ // Get getSaleById if needed
    currency: state.currency,
    getSaleById: (id: string | undefined) => id ? state.sales.find(s => s.id === id) : undefined
  }));

  if (!debt) return null;

  const formatValue = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return "N/A";
    return formatCurrency(value, currency);
  };

  const formatDate = (dateString: string | undefined | null, includeTime: boolean = false) => {
    if (!dateString) return "N/A";
    try {
        const formatString = includeTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy";
      return format(parseISO(dateString), formatString, { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  const statusProps = getStatusProps(debt.status);
  const remainingAmount = debt.amount - debt.amountPaid;
  const progress = debt.amount > 0 ? (debt.amountPaid / debt.amount) * 100 : 0;
  const relatedSale = getSaleById(debt.relatedSaleId); // Fetch related sale details


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className={`h-5 w-5 ${debt.type === 'receivable' ? 'text-green-600' : 'text-red-600'}`} />
            Detalhes da Dívida ({debt.type === 'receivable' ? 'A Receber' : 'A Pagar'})
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre o registro: "{debt.description}".
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow overflow-y-auto pr-6">
          <div className="grid gap-3 py-4">
            {/* Description and Contact */}
            <div className="flex items-start gap-2 border-b pb-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-1"/>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">Descrição:</span>
                    <span className="font-semibold">{debt.description}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground"/>
                <span className="text-sm font-medium text-muted-foreground">Contato:</span>
                <span>{debt.contactName || 'N/A'}</span>
            </div>

             <Separator className="my-1"/>

             {/* Financial Details */}
            <h4 className="text-md font-semibold mb-1">Valores</h4>
            <div className="grid grid-cols-2 items-center gap-x-4 gap-y-1 text-sm">
                 <span className="font-medium text-muted-foreground flex items-center gap-1"><DollarSign className="h-4 w-4"/> Valor Total</span>
                 <span>{formatValue(debt.amount)}</span>

                 <span className="font-medium text-muted-foreground flex items-center gap-1"><DollarSign className="h-4 w-4"/> Valor Pago/Recebido</span>
                 <span className="text-green-600">{formatValue(debt.amountPaid)}</span>

                 <span className="font-medium text-muted-foreground flex items-center gap-1"><DollarSign className="h-4 w-4"/> Valor Restante</span>
                 <span className={`${remainingAmount > 0 ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                     {formatValue(remainingAmount)}
                 </span>
            </div>
             {/* Progress Bar */}
             <div className="mt-2">
                <Progress value={progress} className="h-2 w-full" />
                <p className="text-xs text-muted-foreground text-center mt-1">{progress.toFixed(0)}% Concluído</p>
            </div>

             <Separator className="my-2"/>

            {/* Status and Dates */}
             <h4 className="text-md font-semibold mb-1">Status e Datas</h4>
             <div className="grid grid-cols-2 items-center gap-x-4 gap-y-1 text-sm">
                 <span className="font-medium text-muted-foreground flex items-center gap-1"><statusProps.icon className="h-4 w-4"/> Status</span>
                  <Badge variant="outline" className={`border ${statusProps.color} justify-self-start`}>
                       {statusProps.text}
                   </Badge>

                 <span className="font-medium text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4"/> Data de Vencimento</span>
                 <span>{formatDate(debt.dueDate)}</span>

                 <span className="font-medium text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4"/> Data de Criação</span>
                 <span>{formatDate(debt.createdAt, true)}</span>

                 <span className="font-medium text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4"/> Data de Pagamento</span>
                 <span>{debt.status === 'paid' ? formatDate(debt.paidAt, true) : 'N/A'}</span>
             </div>

              {/* Related Sale Link */}
              {relatedSale && (
                  <>
                    <Separator className="my-2"/>
                    <h4 className="text-md font-semibold mb-1">Vínculo</h4>
                     <div className="flex items-center gap-2 text-sm">
                       <LinkIcon className="h-4 w-4 text-muted-foreground"/>
                       <span className="font-medium text-muted-foreground">Venda Relacionada:</span>
                        {/* Ideally, link to the sale details page if available */}
                       <span className="text-blue-600 hover:underline cursor-pointer">
                           {relatedSale.productName} ({formatValue(relatedSale.saleValue)})
                       </span>
                    </div>
                  </>
              )}

          </div>
        </ScrollArea>

        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
