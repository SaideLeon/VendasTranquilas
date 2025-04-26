// src/components/sale/sale-form.tsx
"use client";

import React from "react";
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
import { getCurrencyConfig } from "@/config/currencies"; // Import currency config
import { formatCurrency } from "@/lib/currency-utils"; // Import formatting util


const formSchema = z.object({
  productId: z.string().min(1, { message: "Selecione um produto." }),
  quantitySold: z.coerce.number().int().positive({
    message: "A quantidade vendida/perdida deve ser um número inteiro positivo.",
  }),
  saleValue: z.coerce.number().nonnegative({ // Allow 0 for losses where no money was received
    message: "O valor da venda deve ser um número não negativo.",
  }),
  isLoss: z.boolean().default(false),
  lossReason: z.string().optional(),
}).refine(data => !data.isLoss || (data.isLoss && data.lossReason && data.lossReason.trim().length > 0), { // Ensure reason is not just whitespace
    message: "O motivo da perda é obrigatório ao registrar um prejuízo.",
    path: ["lossReason"], // path of error
}).refine(data => {
     // Check stock (for both sales and losses, as the item is removed from inventory)
     const product = useStore.getState().getProductById(data.productId);
     // Ensure product exists before checking quantity
     return product && product.quantity >= data.quantitySold;
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
  const { products, currency } = useStore(); // Get products and currency
  const currencyConfig = getCurrencyConfig(currency);
  const currencySymbol = currencyConfig?.symbol || currency; // Fallback to code

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
       const currentSaleValue = form.getValues("saleValue");
       const isSaleValueDirty = form.formState.dirtyFields.saleValue;

       // Set suggested price if applicable and not manually changed
       if (suggestedSalePrice > 0 && !watchIsLoss && (currentSaleValue === 0 || !isSaleValueDirty)) {
           form.setValue("saleValue", parseFloat(suggestedSalePrice.toFixed(2)), { shouldValidate: true });
       }

        // If switching to loss, reset sale value to 0
       if (watchIsLoss) {
            form.setValue("saleValue", 0, { shouldDirty: true, shouldValidate: true }); // Mark as dirty to prevent suggested price override later
        } else if (currentSaleValue === 0 && !isSaleValueDirty) {
             // If switching back from loss, value is 0, and not manually set, recalculate
             const newSuggested = selectedProduct ? (selectedProduct.acquisitionValue * watchQuantitySold) * 1.5 : 0;
             if (newSuggested > 0) {
                 form.setValue("saleValue", parseFloat(newSuggested.toFixed(2)), { shouldValidate: true });
             }
        }
   }, [suggestedSalePrice, form, watchIsLoss, selectedProduct, watchQuantitySold]);


  const handleFormSubmit = async (values: SaleFormData) => {
    const success = await onSubmit(values);
    if (success) {
        form.reset(); // Reset form after successful submission
        // Manually reset productId in select if needed, though form.reset should handle it
         form.setValue('productId', '');
    }
  };

   // Products available for selection (allow OOS only if loss)
   const availableProducts = products.filter(p => watchIsLoss || p.quantity > 0);
   const hasAvailableProducts = availableProducts.length > 0;


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
                   <Select
                      onValueChange={field.onChange}
                      value={field.value} // Ensure value is controlled
                      disabled={isLoading || !hasAvailableProducts}
                    >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={hasAvailableProducts ? "Selecione um produto" : "Nenhum produto disponível"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hasAvailableProducts ? availableProducts.map((product) => (
                        <SelectItem
                            key={product.id}
                            value={product.id}
                            // Disable if not loss and out of stock
                            disabled={!watchIsLoss && product.quantity <= 0}
                         >
                          {product.name} ({product.quantity} em estoque)
                        </SelectItem>
                      )) : <SelectItem value="no-products" disabled>Nenhum produto disponível</SelectItem> }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

             {selectedProduct && (selectedProduct.quantity < watchQuantitySold) && (
                <FormDescription className="text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> Estoque insuficiente ({selectedProduct.quantity} disponível). A quantidade será registrada como negativa se prosseguir.
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
                  {/* Update label to include currency */}
                  <FormLabel>Valor Total da Venda ({currencySymbol})</FormLabel>
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
                        Preço sugerido: {formatCurrency(suggestedSalePrice, currency)}
                     </FormDescription>
                   )}
                   {watchIsLoss && (
                       <FormDescription>
                            O valor da venda é 0 para perdas. O custo do produto ({formatCurrency(selectedProduct?.acquisitionValue, currency)} por unidade) será registrado como prejuízo.
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
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
                      Marque se o item saiu do estoque sem gerar receita (dano, vencimento, furto, etc.).
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
                    <FormLabel>Motivo da Perda (Obrigatório)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o motivo da perda (Ex: Produto danificado, Vencido, Furto)"
                        {...field}
                        value={field.value ?? ''} // Ensure value is not null/undefined
                        disabled={isLoading}
                         />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button
                type="submit"
                disabled={isLoading || !hasAvailableProducts || (selectedProduct && selectedProduct.quantity < watchQuantitySold)}
                className="w-full bg-accent hover:bg-accent/90"
                >
               {isLoading ? "Registrando..." : (watchIsLoss ? "Registrar Perda" : "Registrar Venda")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
