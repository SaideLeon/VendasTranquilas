"use client";

import React, { useMemo } from 'react';
import { useStore } from '@/store/store';
import ReportCard from '@/components/report/report-card';
import { Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown, Star, AlertOctagon, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RelatoriosPage() {
  const { getSalesReportData } = useStore();

  const reportData = useMemo(() => {
    return getSalesReportData();
  }, [getSalesReportData]); // Recalculate only when the function reference changes (which it shouldn't often)

  const formatCurrency = (value: number | undefined | null) => {
      if (value === undefined || value === null) return "N/A";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
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
           colorClass="text-blue-600"
        />
        <ReportCard
          title="Total de Vendas/Perdas"
          value={reportData.totalSales}
          icon={ShoppingCart}
          description="Número total de registros de vendas e perdas."
           colorClass="text-indigo-600"
        />
         <ReportCard
          title="Investimento Total (Estoque)"
          value={formatCurrency(reportData.totalInvestment)}
          icon={DollarSign}
          description="Custo total de aquisição dos produtos atualmente em estoque."
           colorClass="text-amber-600"
        />
        <ReportCard
          title="Faturamento Total"
          value={formatCurrency(reportData.totalRevenue)}
          icon={DollarSign}
          description="Soma de todos os valores de venda registrados (exclui perdas)."
           colorClass="text-cyan-600"
        />

      </div>

       <div className="grid gap-4 md:grid-cols-2">
            <ReportCard
                title="Lucro Total"
                value={formatCurrency(reportData.totalProfit)}
                icon={TrendingUp}
                description="Lucro líquido total (Faturamento - Custo das Vendas - Prejuízos)."
                colorClass={reportData.totalProfit >= 0 ? "text-green-600" : "text-red-600"}
                />
             <ReportCard
                title="Prejuízos Totais (Perdas)"
                value={formatCurrency(reportData.totalLossValue)}
                icon={TrendingDown}
                description="Valor total dos custos dos produtos registrados como perda."
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
                        <p className="text-xs text-muted-foreground pt-1">Lucro gerado: {formatCurrency(reportData.mostProfitableProduct.profit)}</p>
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
                        <p className="text-xs text-muted-foreground pt-1">Prejuízo registrado: {formatCurrency(reportData.highestLossProduct.lossValue)}</p>
                     </>
                 ) : (
                     <p className="text-muted-foreground">Nenhuma perda registrada ainda.</p>
                 )}
            </CardContent>
           </Card>
       </div>

    </div>
  );
}
