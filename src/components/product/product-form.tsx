// src/components/product/product-form.tsx
"use client";

import React from "react"; // Added React import
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
import { useStore } from "@/store/store"; // Import useStore
import { getCurrencyConfig } from "@/config/currencies"; // Import currency config

// Schema remains the same for the form input itself
const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do produto deve ter pelo menos 2 caracteres.",
  }),
  acquisitionValue: z.coerce.number().positive({ // Total acquisition value for the quantity entered
    message: "O valor de aquisição deve ser um número positivo.",
  }),
  quantity: z.coerce.number().int().positive({ // Quantity being added/edited now
    message: "A quantidade deve ser um número inteiro positivo.",
  }),
});

type ProductFormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  // onSubmit now expects the form data, store handles the rest
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product | null; // For editing
  isLoading?: boolean;
}

export default function ProductForm({ onSubmit, initialData, isLoading = false }: ProductFormProps) {
  const { currency } = useStore(); // Get current currency from store
  const currencyConfig = getCurrencyConfig(currency);
  const currencySymbol = currencyConfig?.symbol || currency; // Fallback to code if symbol not found

  const form = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      acquisitionValue: initialData?.acquisitionValue || 0,
      quantity: initialData?.quantity || 1, // Default to 1 for new products
    },
  });

   // Reset form if initialData changes (e.g., when switching between editing products or cancelling edit)
   React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        acquisitionValue: initialData.acquisitionValue,
        quantity: initialData.quantity, // Show current quantity when editing
      });
    } else {
        form.reset({ name: "", acquisitionValue: 0, quantity: 1 }); // Reset for new product
    }
  }, [initialData, form]);


  const handleFormSubmit = (values: ProductFormData) => {
    // The onSubmit prop (connected to addProduct/updateProduct)
    // will handle setting initialQuantity for new products.
    // Just pass the form values.
    onSubmit(values);
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
                  {/* Update label to include currency symbol */}
                  <FormLabel>Valor Total de Aquisição ({currencySymbol})</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Ex: 150.00" {...field} disabled={isLoading}/>
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
                  <FormLabel>{initialData ? "Quantidade Atual em Estoque" : "Quantidade Inicial"}</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" min="1" placeholder="Ex: 50" {...field} disabled={isLoading}/>
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
