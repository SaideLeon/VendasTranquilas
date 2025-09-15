"use client";

import React, { useState, useEffect } from 'react';
import SaleForm from '@/components/sale/sale-form';
import SalesList from '@/components/sale/sales-list';
import SaleDetailsModal from '@/components/sale/sale-details-modal';
import { useStore } from '@/store/store';
import type { Sale } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function VendasPage() {
  const { token, isAuthenticating } = useAuth();
  const { sales, addSale, deleteSale, products, getProductById, isLoading, error, initializeData } = useStore();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      initializeData();
    }
  }, [token, initializeData]);

  const handleFormSubmit = async (data: Omit<Sale, 'id' | 'profit' | 'productName' | 'createdAt' | 'userId' | 'user'>) => {
    try {
      const result = await addSale(data);
      if (result) {
        toast({
          title: data.isLoss ? "Perda Registrada" : "Venda Registrada",
          description: `${data.quantitySold} unidade(s) de ${result.productName} ${data.isLoss ? 'registrada(s) como perda' : 'vendida(s)'}.`,
        });
        setIsFormVisible(false);
        return true;
      } else {
        toast({
          title: "Erro ao Registrar",
          description: useStore.getState().error || "Não foi possível registrar a venda/perda. Verifique o estoque.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error adding sale:", error);
      toast({
        title: "Erro ao Registrar",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDelete = async (saleId: string) => {
    try {
      const saleToDelete = sales.find(s => s.id === saleId);
      await deleteSale(saleId);
      toast({
        title: "Registro Excluído",
        description: `Registro de ${saleToDelete?.isLoss ? 'perda' : 'venda'} para ${saleToDelete?.productName} excluído.`,
        variant: "destructive"
      });
      if (viewingSale?.id === saleId) {
        setIsDetailsModalOpen(false);
        setViewingSale(null);
      }
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast({
        title: "Erro ao Excluir",
        description: "Não foi possível excluir o registro.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (sale: Sale) => {
    setViewingSale(sale);
    setIsDetailsModalOpen(true);
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  const hasProducts = products.length > 0;

  if (isAuthenticating || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="text-lg font-semibold">Erro ao carregar dados</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => initializeData()} className="mt-4">Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="md:hidden flex justify-end mb-4">
        <Button onClick={toggleFormVisibility} variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!hasProducts}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {isFormVisible ? "Fechar Formulário" : "Nova Venda/Perda"}
        </Button>
        {!hasProducts && <p className="text-sm text-muted-foreground text-right mt-1">Cadastre produtos primeiro.</p>}
      </div>

      <div className={`${isFormVisible ? 'block' : 'hidden'} md:block`}>
        {hasProducts ? (
          <SaleForm onSubmit={handleFormSubmit} />
        ) : (
          <div className="text-center text-muted-foreground p-8 border rounded-md bg-card">
            Por favor, cadastre produtos na aba "Produtos" antes de registrar vendas.
          </div>
        )}
      </div>

      <SalesList
        sales={sales}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
      />

      {viewingSale && (
        <SaleDetailsModal
          sale={viewingSale}
          product={getProductById(viewingSale.productId)}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
    </div>
  );
}