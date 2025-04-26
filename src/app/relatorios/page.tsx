// src/app/relatorios/page.tsx
"use client";

import React, { useMemo } from 'react';
import { useStore } from '@/store/store';
import ReportCard from '@/components/report/report-card';
import { Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown, Star, AlertOctagon, BarChart3, Info } from 'lucide-react'; // Added Info icon
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency-utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components

export default function RelatoriosPage() {
  // Get required state including the current currency and the report data calculation function
  const { getSalesReportData, currency } = useStore(state => ({
    getSalesReportData: state.getSalesReportData,
    currency: state.currency,
  }));

  // Memoize report data calculation based on the store's data getter
  const reportData = useMemo(() => {
    return getSalesReportData();
  }, [getSalesReportData]); // Recalculate only when the function reference changes (which happens when products/sales change)

  // Use the utility function, passing the current currency from the store
  const formatValue = (value: number | undefined | null): string => {
      return formatCurrency(value, currency);
  };

  return (
    <TooltipProvider> {/* Wrap the whole page content in TooltipProvider */}
      <div className="container mx-auto p-4 space-y-8">
        <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
          <BarChart3 className="h-6 w-6 text-primary-foreground"/>
          Relatórios e Estatísticas
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ReportCard
            title="Total de Produtos"
            value={reportData.totalProducts}
            icon={Package}
            description="Quantidade total de tipos de produto cadastrados."
            colorClass="text-blue-600" // Consider using theme variables
          />
          <ReportCard
            title="Total de Vendas/Perdas"
            value={reportData.totalSales}
            icon={ShoppingCart}
            description="Número total de registros de vendas e perdas."
            colorClass="text-indigo-600"
          />
           <ReportCard
            title="Valor do Estoque Atual"
            value={formatValue(reportData.totalInvestment)}
            icon={DollarSign}
            description="Custo total estimado dos produtos em estoque baseado no custo unitário inicial."
            tooltip="Calculado como: Σ (Custo Unitário Inicial * Quantidade Atual em Estoque) para cada produto."
            colorClass="text-amber-600"
          />
          <ReportCard
            title="Faturamento Total"
            value={formatValue(reportData.totalRevenue)}
            icon={DollarSign}
            description="Soma de todos os valores de venda (exclui perdas)."
            tooltip="Receita bruta total das vendas realizadas."
            colorClass="text-cyan-600"
          />

        </div>

         <div className="grid gap-4 md:grid-cols-2">
              <ReportCard
                  title="Lucro Líquido Total"
                  value={formatValue(reportData.totalProfit)}
                  icon={TrendingUp}
                  description="Faturamento - Custo dos Produtos Vendidos - Prejuízos Totais."
                  tooltip="Resultado financeiro final após custos e perdas."
                  colorClass={reportData.totalProfit >= 0 ? "text-green-600" : "text-red-600"}
                  />
               <ReportCard
                  title="Prejuízos Totais (Perdas)"
                  value={formatValue(reportData.totalLossValue)}
                  icon={TrendingDown}
                  description="Custo total dos produtos registrados como perda."
                  tooltip="Custo total dos itens removidos do estoque devido a danos, vencimento, etc."
                  colorClass={reportData.totalLossValue > 0 ? "text-red-600" : "text-gray-500"}
                  />
         </div>


         <div className="grid gap-4 md:grid-cols-2">
             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Produto Mais Rentável</CardTitle>
                  <Star className="h-4 w-4 text-yellow-500" />
               </CardHeader>
               <CardContent>
                   {reportData.mostProfitableProduct ? (
                       <>
                          <div className="text-2xl font-bold text-green-600">{reportData.mostProfitableProduct.name}</div>
                          <p className="text-xs text-muted-foreground pt-1">
                            Lucro gerado: {formatValue(reportData.mostProfitableProduct.profit)}
                          </p>
                       </>
                   ) : (
                       <p className="text-muted-foreground">Nenhum lucro registrado ainda.</p>
                   )}
              </CardContent>
             </Card>

              <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Produto com Maior Prejuízo</CardTitle>
                  <AlertOctagon className="h-4 w-4 text-orange-600" />
               </CardHeader>
               <CardContent>
                   {reportData.highestLossProduct ? (
                       <>
                          <div className="text-2xl font-bold text-red-600">{reportData.highestLossProduct.name}</div>
                          <p className="text-xs text-muted-foreground pt-1">
                           Prejuízo registrado: {formatValue(reportData.highestLossProduct.lossValue)}
                          </p>
                       </>
                   ) : (
                       <p className="text-muted-foreground">Nenhuma perda registrada ainda.</p>
                   )}
              </CardContent>
             </Card>
         </div>

      </div>
    </TooltipProvider> // Close TooltipProvider
  );
}
