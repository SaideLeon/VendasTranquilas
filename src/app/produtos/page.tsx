"use client";

import React, { useState } from 'react';
import ProductForm from '@/components/product/product-form';
import ProductList from '@/components/product/product-list';
import { useStore } from '@/store/store';
import type { Product } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function ProdutosPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false); // Control form visibility on mobile/smaller screens
  const { toast } = useToast();

  const handleFormSubmit = (data: Omit<Product, 'id' | 'createdAt'>) => {
    try {
        if (editingProduct) {
            updateProduct({ ...editingProduct, ...data });
            toast({
                title: "Produto Atualizado",
                description: `"${data.name}" foi atualizado com sucesso.`,
            });
            setEditingProduct(null); // Close edit form
            setIsFormVisible(false); // Hide form on mobile after edit
        } else {
            addProduct(data);
            toast({
                title: "Produto Adicionado",
                description: `"${data.name}" foi adicionado com sucesso.`,
            });
            // Keep form open for potentially adding more products, or:
             setIsFormVisible(false); // Hide form on mobile after add
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
    setIsFormVisible(true); // Ensure form is visible when editing
     window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to show form
  };

  const handleDelete = (productId: string) => {
     try {
         const productToDelete = products.find(p => p.id === productId);
        deleteProduct(productId);
        toast({
            title: "Produto Excluído",
            description: `"${productToDelete?.name}" foi excluído com sucesso.`,
            variant: "destructive" // Use destructive variant for deletions
        });
         if (editingProduct?.id === productId) {
             setEditingProduct(null); // Close form if the edited product was deleted
             setIsFormVisible(false);
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

   const toggleFormVisibility = () => {
       if (isFormVisible && editingProduct) {
            setEditingProduct(null); // Cancel editing when hiding form via button
       }
       setIsFormVisible(!isFormVisible);
   };


  return (
    <div className="container mx-auto p-4 space-y-8">
       {/* Button to toggle form visibility on smaller screens */}
      <div className="md:hidden flex justify-end mb-4">
        <Button onClick={toggleFormVisibility} variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" />
          {isFormVisible ? (editingProduct ? "Cancelar Edição" : "Fechar Formulário") : "Novo Produto"}
        </Button>
      </div>

       {/* Form Section */}
       <div className={`${isFormVisible ? 'block' : 'hidden'} md:block`}>
           <ProductForm
             key={editingProduct ? editingProduct.id : 'new'} // Force re-render when switching between new/edit
             onSubmit={handleFormSubmit}
             initialData={editingProduct}
           />
       </div>


      {/* List Section */}
      <ProductList products={products} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
