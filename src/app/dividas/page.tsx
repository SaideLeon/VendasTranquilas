// src/app/dividas/page.tsx
"use client";

import React, { useState } from 'react';
import { useStore } from '@/store/store';
import type { Debt } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import DebtForm from '@/components/debt/debt-form';
import DebtList from '@/components/debt/debt-list';
import DebtDetailsModal from '@/components/debt/debt-details-modal'; // Import modal if needed
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DividasPage() {
  const { debts, addDebt, updateDebt, deleteDebt, getDebtById } = useStore();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [viewingDebt, setViewingDebt] = useState<Debt | null>(null); // For details modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // For details modal
  const { toast } = useToast();

  const handleFormSubmit = (data: Omit<Debt, 'id' | 'createdAt' | 'status' | 'amountPaid'> & { amountPaid?: number; status?: Debt['status'] }) => {
    try {
      if (editingDebt) {
        // When editing, merge existing debt with form data
        // Ensure status and paidAt are handled correctly based on amountPaid vs amount
        const updates: Partial<Omit<Debt, 'id' | 'createdAt'>> = {
            ...data,
            amountPaid: data.amountPaid ?? editingDebt.amountPaid, // Keep existing if not provided
        };
        updateDebt(editingDebt.id, updates);
        toast({
          title: "Dívida Atualizada",
          description: `Registro de "${data.description}" atualizado.`,
        });
        setEditingDebt(null);
        setIsFormVisible(false);
      } else {
        addDebt(data); // Pass only the required fields for adding
        toast({
          title: "Dívida Adicionada",
          description: `Registro de "${data.description}" adicionado com sucesso.`,
        });
        setIsFormVisible(false);
      }
    } catch (error) {
      console.error("Error saving debt:", error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o registro de dívida.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setIsFormVisible(true);
     window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top for editing
  };

  const handleDelete = (debtId: string) => {
    try {
      const debtToDelete = getDebtById(debtId);
      deleteDebt(debtId);
      toast({
        title: "Dívida Excluída",
        description: `Registro "${debtToDelete?.description}" excluído.`,
        variant: "destructive",
      });
      if (editingDebt?.id === debtId) {
        setEditingDebt(null);
        setIsFormVisible(false);
      }
       if (viewingDebt?.id === debtId) { // Close details modal if viewed debt is deleted
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
            setEditingDebt(null); // Cancel edit if closing form
       }
       setIsFormVisible(!isFormVisible);
   };

   // Filter debts for receivables and payables
   const receivables = debts.filter(d => d.type === 'receivable');
   const payables = debts.filter(d => d.type === 'payable');

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Toggle Form Button (Mobile) */}
      <div className="md:hidden flex justify-end mb-4">
        <Button onClick={toggleFormVisibility} variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" />
          {isFormVisible ? (editingDebt ? "Cancelar Edição" : "Fechar Formulário") : "Novo Registro"}
        </Button>
      </div>

      {/* Form Section (visible based on state) */}
      <div className={`${isFormVisible ? 'block' : 'hidden'} md:block mb-8`}>
         <DebtForm
            key={editingDebt ? editingDebt.id : 'new'} // Force re-render on edit/new
            onSubmit={handleFormSubmit}
            initialData={editingDebt}
            onCancel={() => { setEditingDebt(null); setIsFormVisible(false); }}
         />
      </div>

      {/* Debt Lists using Tabs */}
      <Tabs defaultValue="receivable" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receivable">A Receber ({receivables.length})</TabsTrigger>
          <TabsTrigger value="payable">A Pagar ({payables.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="receivable">
           <DebtList
             title="Contas a Receber"
             debts={receivables}
             onEdit={handleEdit}
             onDelete={handleDelete}
             onViewDetails={handleViewDetails}
             onUpdate={updateDebt} // Pass update function for quick status/payment updates
           />
        </TabsContent>
        <TabsContent value="payable">
           <DebtList
             title="Contas a Pagar"
             debts={payables}
             onEdit={handleEdit}
             onDelete={handleDelete}
             onViewDetails={handleViewDetails}
             onUpdate={updateDebt} // Pass update function
           />
        </TabsContent>
      </Tabs>


      {/* Debt Details Modal */}
      {viewingDebt && (
           <DebtDetailsModal
             debt={viewingDebt}
             isOpen={isDetailsModalOpen}
             onClose={() => setIsDetailsModalOpen(false)}
           />
       )}
    </div>
  );
}
