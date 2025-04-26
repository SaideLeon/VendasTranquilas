"use client";

import React from "react"; // Import React
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackagePlus, Save } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do produto deve ter pelo menos 2 caracteres.",
  }),
  acquisitionValue: z.coerce.number().positive({ // coerce converts string input to number
    message: "O valor de aquisição deve ser um número positivo.",
  }),
  quantity: z.coerce.number().int().nonnegative({
    message: "A quantidade deve ser um número inteiro não negativo.",
  }),
});

type ProductFormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product | null; // For editing
  isLoading?: boolean;
}

export default function ProductForm({ onSubmit, initialData, isLoading = false }: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      acquisitionValue: initialData?.acquisitionValue || 0,
      quantity: initialData?.quantity || 0,
    },
  });

   // Reset form if initialData changes (e.g., when switching between editing products)
   React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        acquisitionValue: initialData.acquisitionValue,
        quantity: initialData.quantity,
      });
    } else {
        form.reset({ name: "", acquisitionValue: 0, quantity: 0 }); // Reset for new product
    }
  }, [initialData, form]);


  const handleFormSubmit = (values: ProductFormData) => {
    onSubmit(values);
     // Don't reset here if it's an edit form that stays open
     // if (!initialData) {
     //    form.reset(); // Reset form after successful submission for new product
     // }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            {initialData ? <Save className="h-5 w-5 text-accent"/> : <PackagePlus className="h-5 w-5 text-accent" />}
            {initialData ? "Editar Produto" : "Adicionar Novo Produto"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Camiseta Básica" {...field} disabled={isLoading}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acquisitionValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor de Aquisição (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Ex: 15.50" {...field} disabled={isLoading}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade em Estoque</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" placeholder="Ex: 50" {...field} disabled={isLoading}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
               {isLoading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Adicionar Produto")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
