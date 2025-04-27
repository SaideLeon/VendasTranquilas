// src/components/debt/debt-list.tsx
"use client";

import React, { useState } from 'react';
import type { Debt, DebtStatus } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search, HandCoins, Eye, CheckCircle, XCircle, Clock, MoreHorizontal } from "lucide-react"; // Added Eye and status icons
import { format, parseISO } from 'date-fns';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge"; // For status badge
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { useStore } from '@/store/store';
import { formatCurrency } from '@/lib/currency-utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress"; // Import Progress component
import { useToast } from '@/hooks/use-toast';

interface DebtListProps {
  title: string;
  debts: Debt[];
  onEdit: (debt: Debt) => void;
  onDelete: (debtId: string) => void;
  onViewDetails: (debt: Debt) => void;
  onUpdate: (debtId: string, updates: Partial<Omit<Debt, 'id' | 'createdAt'>>) => void; // For quick updates
}

// Helper to get status display properties
const getStatusProps = (status: DebtStatus): { text: string; color: string; icon: React.ElementType } => {
    switch (status) {
        case 'paid':
            return { text: 'Pago', color: 'text-green-600 bg-green-100 border-green-300', icon: CheckCircle };
        case 'partially_paid':
            return { text: 'Parcial', color: 'text-yellow-600 bg-yellow-100 border-yellow-300', icon: Clock }; // Or a different icon
        case 'pending':
        default:
            return { text: 'Pendente', color: 'text-red-600 bg-red-100 border-red-300', icon: XCircle }; // Or Clock icon
    }
};

export default function DebtList({ title, debts, onEdit, onDelete, onViewDetails, onUpdate }: DebtListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debtToDelete, setDebtToDelete] = useState<Debt | null>(null);
  const [quickPayAmount, setQuickPayAmount] = useState<number | string>(''); // For quick pay input
  const [quickPayDebtId, setQuickPayDebtId] = useState<string | null>(null); // Track which debt is being quick-paid
  const { currency } = useStore();
  const { toast } = useToast();

  const filteredDebts = React.useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return debts.filter((debt) =>
      debt.description.toLowerCase().includes(lowerSearchTerm) ||
      debt.contactName?.toLowerCase().includes(lowerSearchTerm)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort newest first by default
  }, [debts, searchTerm]);

  const formatValue = (value: number | undefined | null): string => {
    return formatCurrency(value, currency);
  };

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  const handleDeleteClick = (debt: Debt) => {
    setDebtToDelete(debt);
  };

  const confirmDelete = () => {
    if (debtToDelete) {
      onDelete(debtToDelete.id);
      setDebtToDelete(null);
    }
  };

   const handleQuickPayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       setQuickPayAmount(e.target.value);
   };

  const handleQuickPaySubmit = (debtId: string, currentPaid: number, totalAmount: number) => {
        const amount = parseFloat(quickPayAmount as string);
        if (isNaN(amount) || amount <= 0) {
            toast({ title: "Valor Inválido", description: "Por favor, insira um valor de pagamento válido.", variant: "destructive" });
            return;
        }

        const newAmountPaid = currentPaid + amount;
        if (newAmountPaid > totalAmount) {
             toast({ title: "Valor Excede Dívida", description: `O pagamento máximo é ${formatValue(totalAmount - currentPaid)}.`, variant: "destructive" });
             return;
        }

        try {
            onUpdate(debtId, { amountPaid: newAmountPaid });
            toast({ title: "Pagamento Registrado", description: `Pagamento de ${formatValue(amount)} registrado para ${debtId}.` });
            setQuickPayAmount(''); // Clear input
            setQuickPayDebtId(null); // Close quick pay section
        } catch (error) {
             toast({ title: "Erro ao Registrar Pagamento", description: "Não foi possível registrar o pagamento.", variant: "destructive" });
        }
    };


   const handleMarkAsPaid = (debt: Debt) => {
       try {
           onUpdate(debt.id, { amountPaid: debt.amount }); // Set amount paid to total amount
           toast({ title: "Dívida Quitada", description: `Dívida "${debt.description}" marcada como paga.` });
       } catch (error) {
           toast({ title: "Erro ao Quitar Dívida", description: "Não foi possível marcar a dívida como paga.", variant: "destructive" });
       }
   };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HandCoins className="h-5 w-5 text-primary-foreground" />
            {title} ({debts.length})
          </div>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar (descrição, contato)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
           {/* Moved TooltipProvider outside Table */}
           <TooltipProvider>
             <Table className="min-w-max">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">Descrição</TableHead>
                  <TableHead className="text-right min-w-[120px]">Valor Total</TableHead>
                  <TableHead className="text-right min-w-[120px]">Valor Pago</TableHead>
                  <TableHead className="text-right min-w-[120px]">Valor Restante</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                   <TableHead className="min-w-[120px]">Progresso</TableHead>{/* Progress Bar */}
                  <TableHead className="min-w-[120px]">Vencimento</TableHead>
                  <TableHead className="min-w-[150px]">Contato</TableHead>
                  <TableHead className="min-w-[150px]">Criado em</TableHead>
                  <TableHead className="sticky right-0 bg-background z-10 text-right min-w-[180px]">Ações</TableHead>{/* Increased width */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDebts.length > 0 ? (
                  filteredDebts.map((debt) => {
                    const statusProps = getStatusProps(debt.status);
                    const remainingAmount = debt.amount - debt.amountPaid;
                    const progress = debt.amount > 0 ? (debt.amountPaid / debt.amount) * 100 : 0;

                    return (// Ensure no whitespace before/after this tag
                      <TableRow key={debt.id}>
                        <TableCell className="sticky left-0 bg-background z-10 font-medium">{debt.description}</TableCell>
                        <TableCell className="text-right">{formatValue(debt.amount)}</TableCell>
                        <TableCell className="text-right">{formatValue(debt.amountPaid)}</TableCell>
                        <TableCell className={`text-right font-semibold ${remainingAmount > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {formatValue(remainingAmount)}
                        </TableCell>
                         <TableCell>
                            <Badge variant="outline" className={`border ${statusProps.color} text-xs`}>
                               <statusProps.icon className="h-3 w-3 mr-1" />
                               {statusProps.text}
                            </Badge>
                        </TableCell>
                         <TableCell>
                             <Tooltip>
                               <TooltipTrigger asChild>
                                   <Progress value={progress} className="h-2 w-24" />
                               </TooltipTrigger>
                               <TooltipContent>
                                   <p>{progress.toFixed(0)}% Pago</p>
                               </TooltipContent>
                            </Tooltip>
                        </TableCell>
                        <TableCell>{formatDate(debt.dueDate)}</TableCell>
                        <TableCell>{debt.contactName || 'N/A'}</TableCell>
                        <TableCell>{formatDate(debt.createdAt)}</TableCell>
                        <TableCell className="sticky right-0 bg-background z-10 text-right space-x-1">
                           {/* Quick Pay/Update */}
                           {debt.status !== 'paid' && (// Ensure no whitespace before/after this tag
                                <DropdownMenu onOpenChange={(open) => { if (!open) setQuickPayDebtId(null); }}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" aria-label={`Registrar pagamento para ${debt.description}`}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                         <DropdownMenuLabel>Pagamento Rápido</DropdownMenuLabel>
                                         <DropdownMenuSeparator />
                                         <div className="p-2 space-y-2">
                                            <Input
                                              type="number"
                                              step="0.01"
                                              placeholder={`Valor (Máx: ${formatValue(remainingAmount)})`}
                                              value={quickPayDebtId === debt.id ? quickPayAmount : ''}
                                              onChange={handleQuickPayChange}
                                              onClick={() => setQuickPayDebtId(debt.id)} // Set current debt for input binding
                                              className="text-sm h-8"
                                            />
                                             <Button
                                                 size="sm"
                                                 className="w-full"
                                                 onClick={() => handleQuickPaySubmit(debt.id, debt.amountPaid, debt.amount)}
                                                 disabled={!quickPayAmount || parseFloat(quickPayAmount as string) <= 0 || parseFloat(quickPayAmount as string) > remainingAmount}
                                             >
                                                Registrar Pagamento
                                             </Button>
                                         </div>
                                         <DropdownMenuSeparator />
                                         <DropdownMenuItem onClick={() => handleMarkAsPaid(debt)}>
                                             Marcar como Totalmente Pago
                                         </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>// Ensure no whitespace before/after this tag
                            )}
                            {/* Actions */}
                          <Button variant="outline" size="icon" onClick={() => onViewDetails(debt)} aria-label={`Visualizar detalhes de ${debt.description}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => onEdit(debt)} aria-label={`Editar ${debt.description}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={debtToDelete?.id === debt.id} onOpenChange={(open) => !open && setDebtToDelete(null)}>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(debt)} aria-label={`Excluir ${debt.description}`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o registro de dívida "{debtToDelete?.description}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDebtToDelete(null)}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>// Ensure no whitespace before/after this tag
                    );
                  })
                ) : (// Ensure no whitespace before/after this tag
                  <TableRow>
                    <TableCell colSpan={10} className="text-center h-24">{/* Adjusted colspan */}
                      <div className="flex flex-col items-center justify-center gap-2">
                        <HandCoins className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm ? `Nenhum registro encontrado para "${searchTerm}".` : 'Nenhum registro de dívida encontrado.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>// Ensure no whitespace before/after this tag
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
