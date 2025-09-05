// src/app/dividas/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/store';
import type { Debt } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import DebtForm from '@/components/debt/debt-form';
import DebtList from '@/components/debt/debt-list';
import DebtDetailsModal from '@/components/debt/debt-details-modal';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from '@/lib/db';

export default function DividasPage() {
  const { deleteDebt } = useStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [viewingDebt, setViewingDebt] = useState<Debt | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setIsFormVisible(true);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (debtId: string) => {
    try {
      const debtToDelete = await db.debts.get(debtId);
      await deleteDebt(debtId);
      toast({
        title: "Dívida Excluída",
        description: `Registro "${debtToDelete?.description}" excluído.`,
        variant: "destructive",
      });
      if (editingDebt?.id === debtId) {
        setEditingDebt(null);
        setIsFormVisible(false);
      }
      if (viewingDebt?.id === debtId) {
        setIsDetailsModalOpen(false);
        setViewingDebt(null);
      }
    } catch (error) {
      console.error("Error deleting debt:", error);
      toast({
        title: "Erro ao Excluir",
        description: "Não foi possível excluir o registro.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (debt: Debt) => {
    setViewingDebt(debt);
    setIsDetailsModalOpen(true);
  };

  const toggleFormVisibility = () => {
    if (isFormVisible && editingDebt) {
      setEditingDebt(null);
    }
    setIsFormVisible(!isFormVisible);
  };

  if (!isMounted) return null;

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="md:hidden flex justify-end mb-4">
        <Button 
          onClick={toggleFormVisibility} 
          variant="outline" 
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {isFormVisible ? (editingDebt ? "Cancelar Edição" : "Fechar Formulário") : "Novo Registro"}
        </Button>
      </div>

      <div className={`mb-8 ${isFormVisible ? 'block' : 'hidden'} md:block`}>
        <DebtForm
          key={editingDebt?.id || 'new'}
          initialData={editingDebt}
          onCancel={() => {
            setEditingDebt(null);
            setIsFormVisible(false);
          }}
        />
      </div>

      <Tabs defaultValue="receivable" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receivable">A Receber</TabsTrigger>
          <TabsTrigger value="payable">A Pagar</TabsTrigger>
        </TabsList>

        <TabsContent value="receivable">
          <DebtList
            title="Contas a Receber"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        <TabsContent value="payable">
          <DebtList
            title="Contas a Pagar"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
      </Tabs>

      <DebtDetailsModal
        debt={viewingDebt}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setViewingDebt(null);
        }}
      />
    </div>
  );
}
