// src/components/debt/debt-form.tsx
"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar"; // Import Calendar
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Import Popover
import type { Debt, DebtType, DebtStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, PlusCircle, CalendarIcon } from "lucide-react"; // Added CalendarIcon
import { useStore } from "@/store/store";
import { getCurrencyConfig } from "@/config/currencies";
import { format, parseISO } from 'date-fns'; // Import date-fns functions
import { cn } from "@/lib/utils";

// Base schema without amountPaid (handled in edit)
const formSchema = z.object({
  type: z.enum(['receivable', 'payable'], { required_error: "Selecione o tipo da dívida." }),
  description: z.string().min(2, {
    message: "A descrição deve ter pelo menos 2 caracteres.",
  }),
  amount: z.coerce.number().positive({
    message: "O valor total deve ser um número positivo.",
  }),
  dueDate: z.date().optional().nullable(), // Allow optional due date
  contactName: z.string().optional(),
  relatedSaleId: z.string().optional(), // Optional link to sale
});

// Schema for editing, includes amountPaid and status
const editFormSchema = formSchema.extend({
    amountPaid: z.coerce.number().nonnegative({
        message: "O valor pago não pode ser negativo.",
    }).optional(), // Optional because it might not be updated every time
    status: z.enum(['pending', 'paid', 'partially_paid']).optional(), // Status can be updated
}).refine(data => !data.amountPaid || data.amountPaid <= data.amount, {
    message: "O valor pago não pode ser maior que o valor total.",
    path: ["amountPaid"],
});


type DebtFormData = z.infer<typeof formSchema>;
type EditDebtFormData = z.infer<typeof editFormSchema>;

interface DebtFormProps {
  onSubmit: (data: DebtFormData | EditDebtFormData) => void;
  initialData?: Debt | null;
  onCancel: () => void; // Function to handle cancellation
  isLoading?: boolean;
}

export default function DebtForm({ onSubmit, initialData, onCancel, isLoading = false }: DebtFormProps) {
  const { currency, sales } = useStore(); // Get sales for linking
  const currencyConfig = getCurrencyConfig(currency);
  const currencySymbol = currencyConfig?.symbol || currency;

  // Determine the correct schema based on whether it's an edit or new form
  const currentSchema = initialData ? editFormSchema : formSchema;

  const form = useForm<DebtFormData | EditDebtFormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          dueDate: initialData.dueDate ? parseISO(initialData.dueDate) : null, // Convert ISO string to Date object
          // Status is managed by the store based on amountPaid, so we don't set it directly as default here
          // amountPaid is already in initialData
        }
      : {
          type: 'receivable',
          description: "",
          amount: 0,
          dueDate: null,
          contactName: "",
          relatedSaleId: "",
          amountPaid: 0, // Default for new
          status: 'pending', // Default for new
        },
  });

  // Reset form if initialData changes (e.g., switching edit or cancelling)
  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        dueDate: initialData.dueDate ? parseISO(initialData.dueDate) : null,
        amountPaid: initialData.amountPaid ?? 0, // Ensure amountPaid exists
        // Don't reset status, let store handle it
      });
    } else {
      form.reset({
        type: 'receivable',
        description: "",
        amount: 0,
        dueDate: null,
        contactName: "",
        relatedSaleId: "",
        amountPaid: 0,
        status: 'pending',
      });
    }
  }, [initialData, form]);

  const handleFormSubmit = (values: DebtFormData | EditDebtFormData) => {
      // Convert dueDate back to ISO string or null before submitting
      const dataToSubmit = {
          ...values,
          dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      };
      onSubmit(dataToSubmit);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                {initialData ? <Save className="h-5 w-5 text-accent" /> : <PlusCircle className="h-5 w-5 text-accent" />}
                {initialData ? "Editar Dívida" : "Adicionar Nova Dívida"}
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
                 Cancelar
            </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="receivable">A Receber</SelectItem>
                          <SelectItem value="payable">A Pagar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total ({currencySymbol})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Ex: 100.50" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Empréstimo para João, Pagamento fornecedor X..." {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             {/* Amount Paid Field (only for editing) */}
             {initialData && (
                <FormField
                    control={form.control}
                    name="amountPaid"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor Pago/Recebido ({currencySymbol})</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Ex: 50.00"
                                    {...field}
                                    // Ensure value is treated as number for validation
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    value={field.value ?? 0} // Handle potential undefined value
                                    disabled={isLoading}
                                />
                            </FormControl>
                             <FormDescription>
                                Atualizar este valor recalculará o status (Pendente, Parcial, Pago).
                             </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
             )}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Data de Vencimento (Opcional)</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoading}
                            >
                            {field.value ? (
                                format(field.value, "dd/MM/yyyy") // Format Date object
                            ) : (
                                <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value ?? undefined} // Pass Date object or undefined
                            onSelect={(date) => field.onChange(date)} // onChange provides Date | undefined
                            disabled={(date) => date < new Date("1900-01-01") || isLoading}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Cliente A, Fornecedor B" {...field} value={field.value ?? ''} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>


            {/* Optional: Link to Sale */}
            {form.watch('type') === 'receivable' && ( // Only show for receivables initially, adjust if needed
                 <FormField
                   control={form.control}
                   name="relatedSaleId"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Venda Relacionada (Opcional)</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={isLoading}>
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder="Vincular a uma venda existente" />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                           <SelectItem value="">Nenhuma</SelectItem>
                           {sales
                             .filter(s => !s.isLoss) // Only link non-loss sales
                             .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort newest first
                             .map((sale) => (
                               <SelectItem key={sale.id} value={sale.id}>
                                 {sale.productName} - {formatCurrency(sale.saleValue, currency)} ({format(new Date(sale.createdAt), "dd/MM/yy")})
                               </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       <FormDescription>Vincular esta dívida a uma venda específica (útil para rastrear pagamentos de vendas a prazo).</FormDescription>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
            )}


            <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
              {isLoading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Adicionar Dívida")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Helper function (consider moving to lib/currency-utils if used elsewhere)
function formatCurrency(value: number, currencyCode: string): string {
    const config = getCurrencyConfig(currencyCode);
    const locale = config?.locale || 'pt-BR'; // Default locale
    const code = config?.code || 'BRL'; // Default currency
    try {
        return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(value);
    } catch (e) {
        console.error("Currency formatting failed:", e);
        return `${config?.symbol || '$'} ${value.toFixed(2)}`;
    }
}
