// src/components/product/product-list.tsx
"use client";

import React, { useState, useMemo } from 'react';
import type { Product } from '@/types';
import { calculateUnitCost } from '@/types'; // Import the helper
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search, PackageX, Package, HelpCircle } from "lucide-react"; // Added HelpCircle
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useStore } from '@/store/store'; // Import useStore
import { formatCurrency } from '@/lib/currency-utils'; // Import the utility
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components


interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export default function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { currency } = useStore(); // Get current currency

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Use the utility function, passing the current currency
  const formatValue = (value: number | undefined | null): string => {
    // Added check for undefined/null before formatting
    if (value === undefined || value === null) {
        return "N/A";
    }
    return formatCurrency(value, currency);
  };

  const formatDate = (dateString: string) => {
      try {
         return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
      } catch (e) {
          return "Data inválida";
      }
  };

  const handleDeleteClick = (product: Product) => {
      setProductToDelete(product);
  };

   const confirmDelete = () => {
     if (productToDelete) {
       onDelete(productToDelete.id);
       setProductToDelete(null); // Close dialog
     }
   };


  return (
     <Card>
         <CardHeader>
             <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                 <Package className="h-5 w-5 text-primary-foreground"/>
                 Lista de Produtos ({products.length})
                </div>
                 <div className="relative ml-auto flex-1 md:grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input
                        type="search"
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                     />
                </div>
             </CardTitle>
         </CardHeader>
          <CardContent>
             <ScrollArea className="h-[400px] rounded-md border"> {/* Adjust height as needed */}
             <TooltipProvider> {/* Wrap table in TooltipProvider */}
                <Table>
                <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">
                       <div className="flex items-center justify-end gap-1">
                            Valor Aquisição
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Valor total pago pela quantidade inicial.</p>
                                </TooltipContent>
                            </Tooltip>
                       </div>
                    </TableHead>
                     <TableHead className="text-right">
                         <div className="flex items-center justify-end gap-1">
                            Valor Unitário
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Custo calculado por unidade (Valor Aquisição / Qtd. Inicial).</p>
                                </TooltipContent>
                             </Tooltip>
                         </div>
                     </TableHead>
                    <TableHead className="text-right">Qtd. Estoque</TableHead>
                    <TableHead className="hidden md:table-cell">Cadastrado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                       const { cost: unitCost, error: unitCostError } = calculateUnitCost(product);
                       return (
                        <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        {/* Show total acquisition value */}
                        <TableCell className="text-right">{formatValue(product.acquisitionValue)}</TableCell>
                        {/* Show calculated unit cost */}
                        <TableCell className="text-right">
                           {unitCostError ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="text-destructive cursor-help">Erro</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{unitCostError}</p>
                                    </TooltipContent>
                                </Tooltip>
                           ) : (
                               formatValue(unitCost)
                           )}
                        </TableCell>
                        {/* Show current quantity */}
                        <TableCell className="text-right">{product.quantity}</TableCell>
                         <TableCell className="hidden md:table-cell">{formatDate(product.createdAt)}</TableCell>
                        <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="icon" onClick={() => onEdit(product)} aria-label={`Editar ${product.name}`}>
                            <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(product)} aria-label={`Excluir ${product.name}`}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                         Tem certeza que deseja excluir o produto "{productToDelete?.name}"? Esta ação não pode ser desfeita e excluirá também todas as vendas associadas a ele.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                        </TableCell>
                        </TableRow>
                       );
                       })
                    ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24"> {/* Increased colSpan */}
                             <div className="flex flex-col items-center justify-center gap-2">
                                <PackageX className="h-8 w-8 text-muted-foreground"/>
                                <p className="text-muted-foreground">
                                    {searchTerm ? 'Nenhum produto encontrado para "' + searchTerm + '".' : 'Nenhum produto cadastrado.'}
                                 </p>
                            </div>
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
                </TooltipProvider> {/* Close TooltipProvider */}
            </ScrollArea>
         </CardContent>
    </Card>
  );
}
