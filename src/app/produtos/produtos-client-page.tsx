// src/app/produtos/produtos-client-page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import ProductForm from '@/components/product/product-form';
import ProductList from '@/components/product/product-list';
import ProductDetailsModal from '@/components/product/product-details-modal';
import { useStore } from '@/store/store';
import type { Product } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, AlertTriangle } from 'lucide-react';

export default function ProdutosClientPage({ initialData }: { initialData: { products: Product[] } }) {
  const { products, addProduct, updateProduct, deleteProduct, isLoading, error, setProducts, initializeData } = useStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setProducts(initialData.products);
  }, [initialData, setProducts]);

  const handleFormSubmit = async (data: Omit<Product, 'id' | 'createdAt' | 'userId' | 'user'> & { initialQuantity?: number }) => {
    try {
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...data });
        toast({
          title: "Produto Atualizado",
          description: `"${data.name}" foi atualizado com sucesso.`,
        });
        setEditingProduct(null);
        setIsFormVisible(false);
      } else {
        const productDataWithInitialQty = {
             ...data,
             initialQuantity: data.initialQuantity ?? data.quantity
         };
        await addProduct(productDataWithInitialQty as Omit<Product, 'id' | 'createdAt' | 'userId' | 'user'>);
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
        description: "NÃ£o foi possÃvel salvar o produto.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (productId: string) => {
    try {
      const productToDelete = products.find(p => p.id === productId);
      await deleteProduct(productId);
      toast({
        title: "Produto ExcluÃdo",
        description: `"${productToDelete?.name}" foi excluÃdo com sucesso.`,
        variant: "destructive"
      });
      if (editingProduct?.id === productId) {
        setEditingProduct(null);
        setIsFormVisible(false);
      }
       if (viewingProduct?.id === productId) {
            setIsDetailsModalOpen(false);
            setViewingProduct(null);
       }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erro ao Excluir",
        description: "NÃ£o foi possÃvel excluir o produto.",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="text-lg font-semibold">Erro ao carregar produtos</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => initializeData()} className="mt-4">Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="md:hidden flex justify-end mb-4">
        <Button onClick={toggleFormVisibility} variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" />
          {isFormVisible ? (editingProduct ? "Cancelar EdiÃ§Ã£o" : "Fechar FormulÃ¡rio") : "Novo Produto"}
        </Button>
      </div>

       <div className={`${isFormVisible ? 'block' : 'hidden'} md:block`}>
           <ProductForm
             key={editingProduct ? editingProduct.id : 'new'}
             onSubmit={handleFormSubmit}
             initialData={editingProduct}
           />
       </div>

      {products.length === 0 ? (
        <div className="text-center text-muted-foreground p-8 border rounded-md bg-card min-h-[200px] flex items-center justify-center">
          <p>Nenhum produto cadastrado.</p>
        </div>
      ) : (
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
        />
      )}

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
