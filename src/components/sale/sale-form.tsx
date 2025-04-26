"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { Product, Sale } from "@/types";
import { useStore } from "@/store/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, AlertTriangle } from "lucide-react";
import React from "react";

const formSchema = z.object({
  productId: z.string().min(1, { message: "Selecione um produto." }),
  quantitySold: z.coerce.number().int().positive({
    message: "A quantidade vendida deve ser um número inteiro positivo.",
  }),
  saleValue: z.coerce.number().nonnegative({ // Allow 0 for losses where no money was received
    message: "O valor da venda deve ser um número não negativo.",
  }),
  isLoss: z.boolean().default(false),
  lossReason: z.string().optional(),
}).refine(data => !data.isLoss || (data.isLoss && data.lossReason && data.lossReason.length > 0), {
    message: "O motivo da perda é obrigatório ao registrar um prejuízo.",
    path: ["lossReason"], // path of error
}).refine(data => {
     // Check stock only if it's not a loss
     if (!data.isLoss) {
        const product = useStore.getState().getProductById(data.productId);
        return !product || product.quantity >= data.quantitySold;
     }
    return true; // Skip stock check for losses
 }, {
    message: "Quantidade em estoque insuficiente.",
    path: ["quantitySold"],
 });


type SaleFormData = z.infer<typeof formSchema>;

interface SaleFormProps {
  onSubmit: (data: SaleFormData) => boolean | Promise<boolean>; // Return true if successful to reset form
  isLoading?: boolean;
}

export default function SaleForm({ onSubmit, isLoading = false }: SaleFormProps) {
  const { products } = useStore();
  const form = useForm<SaleFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "",
      quantitySold: 1,
      saleValue: 0,
      isLoss: false,
      lossReason: "",
    },
  });

   const watchIsLoss = form.watch("isLoss");
   const watchProductId = form.watch("productId");
   const watchQuantitySold = form.watch("quantitySold");

   const selectedProduct = React.useMemo(() => {
       return products.find(p => p.id === watchProductId);
   }, [watchProductId, products]);

   // Calculate suggested price based on acquisition cost (e.g., 50% markup)
   const suggestedSalePrice = React.useMemo(() => {
        if (selectedProduct && watchQuantitySold > 0 && !watchIsLoss) {
            // Example: Suggest price with 50% markup
            const totalAcquisitionCost = selectedProduct.acquisitionValue * watchQuantitySold;
            return totalAcquisitionCost * 1.5; // 50% markup
        }
        return 0;
   }, [selectedProduct, watchQuantitySold, watchIsLoss]);

   // Update saleValue when suggested price changes, but only if user hasn't manually set it
   React.useEffect(() => {
       if (suggestedSalePrice > 0 && form.getValues("saleValue") === 0 && !form.formState.dirtyFields.saleValue) {
           form.setValue("saleValue", parseFloat(suggestedSalePrice.toFixed(2)));
       }
        // If switching to loss, reset sale value to 0
        if (watchIsLoss) {
            form.setValue("saleValue", 0);
        } else if (form.getValues("saleValue") === 0 && !form.formState.dirtyFields.saleValue) {
             // If switching back from loss and value is 0, recalculate suggested price
             const newSuggested = selectedProduct ? (selectedProduct.acquisitionValue * watchQuantitySold) * 1.5 : 0;
             if (newSuggested > 0) {
                 form.setValue("saleValue", parseFloat(newSuggested.toFixed(2)));
             }
        }
   }, [suggestedSalePrice, form, watchIsLoss, selectedProduct, watchQuantitySold]);


  const handleFormSubmit = async (values: SaleFormData) => {
    const success = await onSubmit(values);
    if (success) {
        form.reset(); // Reset form after successful submission
    }
  };

  const availableProducts = products.filter(p => p.quantity > 0 || watchIsLoss); // Allow selecting OOS products if it's a loss

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-accent"/>
          Registrar Nova Venda / Perda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableProducts.length > 0 ? availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id} disabled={product.quantity <= 0 && !watchIsLoss}>
                          {product.name} ({product.quantity} em estoque)
                        </SelectItem>
                      )) : <SelectItem value="no-products" disabled>Nenhum produto disponível</SelectItem> }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

             {selectedProduct && !watchIsLoss && selectedProduct.quantity < watchQuantitySold && (
                <FormDescription className="text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> Estoque insuficiente ({selectedProduct.quantity} disponível).
                </FormDescription>
             )}


            <FormField
              control={form.control}
              name="quantitySold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade Vendida / Perdida</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" min="1" placeholder="Ex: 1" {...field} disabled={isLoading}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="saleValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Total da Venda (R$)</FormLabel>
                  <FormControl>
                     {/* Disable sale value input if it's a loss */}
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={watchIsLoss ? "0.00" : "Ex: 29.90"}
                      {...field}
                      disabled={isLoading || watchIsLoss}
                      readOnly={watchIsLoss}
                     />
                  </FormControl>
                   {suggestedSalePrice > 0 && !watchIsLoss && (
                     <FormDescription>
                        Preço sugerido: {suggestedSalePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                     </FormDescription>
                   )}
                   {watchIsLoss && (
                       <FormDescription>
                            O valor da venda é 0 para perdas. O custo será registrado como prejuízo.
                       </FormDescription>
                   )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isLoss"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Registrar como Prejuízo / Perda?
                    </FormLabel>
                    <FormDescription>
                      Marque esta opção se o produto foi perdido, danificado, ou saiu sem receita.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {watchIsLoss && (
              <FormField
                control={form.control}
                name="lossReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo da Perda</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o motivo da perda (Ex: Produto danificado, Vencido, Furto)"
                        {...field}
                        disabled={isLoading}
                         />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" disabled={isLoading || (availableProducts.length === 0 && !watchIsLoss)} className="w-full bg-accent hover:bg-accent/90">
               {isLoading ? "Registrando..." : (watchIsLoss ? "Registrar Perda" : "Registrar Venda")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
