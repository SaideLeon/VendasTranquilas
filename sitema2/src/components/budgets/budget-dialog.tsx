"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { addBudgetAction, getBudgetSuggestions } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { ExpenseCategories } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";

const budgetSchema = z.object({
  category: z.string().min(1, "Categoria é obrigatória."),
  limit: z.coerce.number().positive("Limite deve ser um valor positivo."),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export function BudgetDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<Record<string, number> | null>(null);
  const { toast } = useToast();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
  });

  const onSubmit = (data: BudgetFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    startTransition(async () => {
      const result = await addBudgetAction(formData);
      if (result.errors) {
        if (result.errors.category) {
          form.setError("category", { message: result.errors.category[0] });
        }
      } else {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
        form.reset();
        setSuggestions(null);
        setOpen(false);
      }
    });
  };

  const handleAISuggestions = () => {
    startSuggestionTransition(async () => {
      const result = await getBudgetSuggestions();
      if(result.error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: result.error,
        });
      } else if (result.suggestions) {
        setSuggestions(result.suggestions);
      }
    });
  }

  const applySuggestion = (category: string, limit: number) => {
    form.setValue("category", category);
    form.setValue("limit", Math.round(limit));
    setSuggestions(null);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        form.reset();
        setSuggestions(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Orçamento</DialogTitle>
          <DialogDescription>
            Defina um limite de gastos para uma categoria.
          </DialogDescription>
        </DialogHeader>
        
        {suggestions ? (
          <div className="space-y-4">
             <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Sugestões de Orçamento</AlertTitle>
              <AlertDescription>
                Com base no seu histórico, sugerimos os seguintes orçamentos mensais.
              </AlertDescription>
            </Alert>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {Object.entries(suggestions).map(([category, limit]) => (
                <div key={category} className="flex justify-between items-center p-2 border rounded-md">
                  <div>
                    <p className="font-medium">{category}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(limit)}</p>
                  </div>
                  <Button size="sm" onClick={() => applySuggestion(category, limit)}>Aplicar</Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => setSuggestions(null)}>Voltar</Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ExpenseCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite Mensal</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="R$ 500,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4 flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                <Button type="button" variant="outline" onClick={handleAISuggestions} disabled={isSuggesting}>
                  {isSuggesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Usar Sugestão IA
                </Button>
                <div className="flex gap-2 justify-end">
                   <DialogClose asChild>
                    <Button variant="ghost">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Criando..." : "Criar Orçamento"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
