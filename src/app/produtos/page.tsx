// src/app/produtos/page.tsx
"use client";

import React, { useState } from 'react';
import ProductForm from '@/components/product/product-form';
import ProductList from '@/components/product/product-list';
import ProductDetailsModal from '@/components/product/product-details-modal'; // Import the modal
import { useStore } from '@/store/store';
import type { Product } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function ProdutosPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null); // State for product details
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // State for modal visibility
  const { toast } = useToast();

  const handleFormSubmit = (data: Omit<Product, 'id' | 'createdAt'> & { initialQuantity?: number }) => {
    try {
      if (editingProduct) {
        // When editing, pass the existing product merged with form data
        updateProduct({ ...editingProduct, ...data });
        toast({
          title: "Produto Atualizado",
          description: `"${data.name}" foi atualizado com sucesso.`,
        });
        setEditingProduct(null);
        setIsFormVisible(false);
      } else {
         // Ensure initialQuantity is set if not provided (should be set by form handler now)
         const productDataWithInitialQty = {
             ...data,
             initialQuantity: data.initialQuantity ?? data.quantity
         };
        addProduct(productDataWithInitialQty as Omit<Product, 'id' | 'createdAt'>); // Type assertion needed if initialQuantity might be missing
        toast({
          title: "Produto Adicionado",
          description: `"${data.name}" foi adicionado com sucesso.`,
        });
        setIsFormVisible(false);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o produto.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (productId: string) => {
    try {
      const productToDelete = products.find(p => p.id === productId);
      deleteProduct(productId);
      toast({
        title: "Produto Excluído",
        description: `"${productToDelete?.name}" foi excluído com sucesso.`,
        variant: "destructive"
      });
      if (editingProduct?.id === productId) {
        setEditingProduct(null);
        setIsFormVisible(false);
      }
       if (viewingProduct?.id === productId) { // Close details modal if viewed product is deleted
            setIsDetailsModalOpen(false);
            setViewingProduct(null);
       }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erro ao Excluir",
        description: "Não foi possível excluir o produto.",
        variant: "destructive",
      });
    }
  };

   const handleViewDetails = (product: Product) => {
       setViewingProduct(product);
       setIsDetailsModalOpen(true);
   };

   const toggleFormVisibility = () => {
       if (isFormVisible && editingProduct) {
            setEditingProduct(null);
       }
       setIsFormVisible(!isFormVisible);
   };


  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="md:hidden flex justify-end mb-4">
        <Button onClick={toggleFormVisibility} variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" />
          {isFormVisible ? (editingProduct ? "Cancelar Edição" : "Fechar Formulário") : "Novo Produto"}
        </Button>
      </div>

       <div className={`${isFormVisible ? 'block' : 'hidden'} md:block`}>
           <ProductForm
             key={editingProduct ? editingProduct.id : 'new'}
             onSubmit={handleFormSubmit}
             initialData={editingProduct}
           />
       </div>

      <ProductList
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails} // Pass the handler
      />

      {/* Product Details Modal */}
       {viewingProduct && (
           <ProductDetailsModal
             product={viewingProduct}
             isOpen={isDetailsModalOpen}
             onClose={() => setIsDetailsModalOpen(false)}
           />
       )}
    </div>
  );
}
