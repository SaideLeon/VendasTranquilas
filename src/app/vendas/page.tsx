"use client";

import React, { useState } from 'react';
import SaleForm from '@/components/sale/sale-form';
import SalesList from '@/components/sale/sales-list';
import { useStore } from '@/store/store';
import type { Sale } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function VendasPage() {
  const { sales, addSale, deleteSale, products } = useStore();
  const [isFormVisible, setIsFormVisible] = useState(false); // Control form visibility
  const { toast } = useToast();

   const handleFormSubmit = async (data: Omit<Sale, 'id' | 'profit' | 'productName' | 'createdAt'>) => {
    try {
        const result = addSale(data);
        if (result) {
             toast({
                 title: data.isLoss ? "Perda Registrada" : "Venda Registrada",
                 description: `${data.quantitySold} unidade(s) de ${result.productName} ${data.isLoss ? 'registrada(s) como perda' : 'vendida(s)'}.`,
             });
             setIsFormVisible(false); // Hide form on mobile after success
             return true; // Indicate success
        } else {
             // Sale might fail due to insufficient stock (already handled by schema)
             // Or product not found (shouldn't happen with select)
             toast({
                title: "Erro ao Registrar",
                description: "Não foi possível registrar a venda/perda. Verifique o estoque.",
                variant: "destructive",
            });
            return false; // Indicate failure
        }

    } catch (error) {
         console.error("Error adding sale:", error);
         toast({
           title: "Erro ao Registrar",
           description: "Ocorreu um erro inesperado.",
           variant: "destructive",
         });
         return false; // Indicate failure
    }
  };

  const handleDelete = (saleId: string) => {
     try {
         const saleToDelete = sales.find(s => s.id === saleId);
         deleteSale(saleId);
         toast({
             title: "Registro Excluído",
             description: `Registro de ${saleToDelete?.isLoss ? 'perda' : 'venda'} para ${saleToDelete?.productName} excluído.`,
             variant: "destructive"
         });
     } catch (error) {
        console.error("Error deleting sale:", error);
         toast({
           title: "Erro ao Excluir",
           description: "Não foi possível excluir o registro.",
           variant: "destructive",
         });
     }
  };

   const toggleFormVisibility = () => {
       setIsFormVisible(!isFormVisible);
   };

   const hasProducts = products.length > 0;


  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Button to toggle form visibility on smaller screens */}
      <div className="md:hidden flex justify-end mb-4">
        <Button onClick={toggleFormVisibility} variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!hasProducts}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {isFormVisible ? "Fechar Formulário" : "Nova Venda/Perda"}
        </Button>
       {!hasProducts && <p className="text-sm text-muted-foreground text-right mt-1">Cadastre produtos primeiro.</p>}
      </div>


      {/* Form Section */}
       <div className={`${isFormVisible ? 'block' : 'hidden'} md:block`}>
           {hasProducts ? (
                <SaleForm onSubmit={handleFormSubmit} />
           ) : (
                <div className="text-center text-muted-foreground p-8 border rounded-md bg-card">
                   Por favor, cadastre produtos na aba "Produtos" antes de registrar vendas.
               </div>
           )}
       </div>

      {/* List Section */}
      <SalesList sales={sales} onDelete={handleDelete} />
    </div>
  );
}
