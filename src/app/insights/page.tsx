'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/store';
import { analyzeFinances } from '@/ai/flows/financial-analysis-flow';
import type { FinancialAnalysisOutput } from '@/ai/types/financial-analysis'; // Updated import path
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BrainCircuit,
  AlertTriangle,
  Lightbulb,
  Scale,
  HandCoins,
  TrendingDown,
  TrendingUp,
  CircleCheck,
  CircleAlert,
  CircleX,
  RefreshCw, // Import the sync icon
  Package,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency-utils';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from "@/components/ui/tooltip";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ProductAnalysisDetail = FinancialAnalysisOutput['productAnalysis'][0];

export default function InsightsPage() {
  const { products, sales, debts, currency, initializeData } = useStore(); // Get initializeData from store
  const [analysisResult, setAnalysisResult] =
    useState<FinancialAnalysisOutput | null>(null);
  const [processState, setProcessState] = useState<'idle' | 'syncing' | 'analyzing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductAnalysisDetail | null>(null);
  const [showLosses, setShowLosses] = useState(false);

  const handleFinancialAnalysis = async () => {
    setProcessState('syncing');
    setError(null);
    setAnalysisResult(null);

    try {
      // Step 1: Sync data
      await initializeData();

      // Step 2: Analyze data
      setProcessState('analyzing');
      const inputData = {
        products: products.map(p => ({ ...p, createdAt: p.createdAt ?? new Date(0).toISOString() })),
        sales: sales.map(s => ({ ...s, createdAt: s.createdAt ?? new Date(0).toISOString(), profit: s.profit ?? 0 })),
        debts: debts.map(d => ({
          ...d,
          dueDate: d.dueDate ? new Date(d.dueDate).toISOString() : null,
          createdAt: d.createdAt ?? new Date(0).toISOString(),
          paidAt: d.paidAt ? new Date(d.paidAt).toISOString() : null,
        })),
        currencyCode: currency,
      };
      const result = await analyzeFinances(inputData);
      setAnalysisResult(result);

    } catch (err) {
      console.error('Financial analysis process failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro durante o processo.'
      );
    } finally {
      setProcessState('idle');
    }
  };

  const formatValue = (value: number | undefined | null): string => {
    return formatCurrency(value, currency);
  };

  const getStatusProps = (
    status: FinancialAnalysisOutput['overallStatus'] | undefined
  ): { text: string; color: string; icon: React.ElementType } => {
    switch (status) {
      case 'healthy':
        return {
          text: 'Saudável',
          color: 'text-green-600 bg-green-100 border-green-300',
          icon: CircleCheck,
        };
      case 'needs_attention':
        return {
          text: 'Requer Atenção',
          color: 'text-yellow-600 bg-yellow-100 border-yellow-300',
          icon: CircleAlert,
        };
      case 'critical':
        return {
          text: 'Crítico',
          color: 'text-red-600 bg-red-100 border-red-300',
          icon: CircleX,
        };
      default:
        return {
          text: 'Indeterminado',
          color: 'text-gray-500 bg-gray-100 border-gray-300',
          icon: CircleAlert,
        };
    }
  };

  const productLosses = selectedProduct ? sales.filter(s => s.productId === selectedProduct.productId && s.isLoss) : [];

  // Ensure no syntax errors before the return statement
  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary-foreground" />
              Análise Financeira com IA
            </CardTitle>
            <CardDescription>
              Obtenha insights e recomendações personalizadas para o seu negócio
              com base nos seus dados de vendas, produtos e dívidas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Button onClick={handleFinancialAnalysis} disabled={processState !== 'idle'}>
              {processState === 'syncing' ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : processState === 'analyzing' ? (
                'Analisando...'
              ) : (
                'Gerar Análise Financeira'
              )}
            </Button>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {processState !== 'idle' && (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        )}

        {analysisResult && processState === 'idle' && (
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resultado da Análise</span>
                <Badge
                  variant="outline"
                  className={`border ${getStatusProps(analysisResult.overallStatus).color}`}
                >
                  {(() => {
                    const { icon: StatusIcon } = getStatusProps(analysisResult.overallStatus);
                    return <StatusIcon className="h-4 w-4 mr-1" />;
                  })()}
                  {getStatusProps(analysisResult.overallStatus).text}
                </Badge>
              </CardTitle>
              <CardDescription>
                Análise gerada em:{' '}
                {new Date().toLocaleString('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" defaultValue={['balance', 'risks', 'recommendations', 'products']} className="w-full">
                {/* Balance Sheet */}
                <AccordionItem value="balance">
                  <AccordionTrigger className="text-lg font-semibold">
                    <Scale className="h-5 w-5 mr-2" /> Resumo Patrimonial
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pl-2">
                    <p className="text-sm text-muted-foreground">
                      {analysisResult.balanceSheetSummary.summary}
                    </p>
                    <div className="overflow-x-auto">
                      <div className="grid grid-cols-4 gap-4 text-center min-w-[500px] lg:min-w-full">
                        <div>
                          <p className="text-xs text-muted-foreground">Ativos (Estoque)</p>
                          <p className="font-semibold text-green-600">
                            {formatValue(analysisResult.balanceSheetSummary.approxAssets)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Passivos (Dívidas)</p>
                          <p className="font-semibold text-red-600">
                            {formatValue(analysisResult.balanceSheetSummary.approxLiabilities)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Perdas Totais</p>
                          <p className="font-semibold text-red-600">
                            {formatValue(analysisResult.balanceSheetSummary.totalLoss)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Patrimônio Líq.</p>
                          <p className={`font-bold ${analysisResult.balanceSheetSummary.approxNetWorth >= 0 ? 'text-primary-foreground' : 'text-destructive'}`}>
                            {formatValue(analysisResult.balanceSheetSummary.approxNetWorth)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Debt Analysis */}
                <AccordionItem value="debts">
                  <AccordionTrigger className="text-lg font-semibold">
                    <HandCoins className="h-5 w-5 mr-2" /> Análise de Dívidas
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pl-2">
                    <p className="text-sm text-muted-foreground">
                      {analysisResult.debtAnalysis.analysis}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Pendente a Receber</p>
                        <p className="font-semibold text-lime-600">
                          {formatValue(analysisResult.debtAnalysis.totalReceivablesPending)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Pendente a Pagar</p>
                        <p className="font-semibold text-orange-600">
                          {formatValue(analysisResult.debtAnalysis.totalPayablesPending)}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Product Analysis */}
                <AccordionItem value="products">
                  <AccordionTrigger className="text-lg font-semibold">
                    <Package className="h-5 w-5 mr-2" /> Análise de Produtos
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pl-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisResult.productAnalysis.map(p => (
                        <Card key={p.productId}>
                          <CardHeader>
                            <CardTitle>{p.productName}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Button onClick={() => setSelectedProduct(p)}>Ver mais detalhes</Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Risk Assessment */}
                <AccordionItem value="risks">
                  <AccordionTrigger className="text-lg font-semibold">
                    <AlertTriangle className="h-5 w-5 mr-2" /> Avaliação de Riscos
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pl-2">
                    <p className="text-sm text-muted-foreground">
                      {analysisResult.riskAssessment.assessment}
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {analysisResult.riskAssessment.identifiedRisks.map(
                        (risk, index) => (
                          <li key={index}>{risk}</li>
                        )
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                {/* Recommendations */}
                <AccordionItem value="recommendations">
                  <AccordionTrigger className="text-lg font-semibold">
                    <Lightbulb className="h-5 w-5 mr-2" /> Recomendações
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pl-2">
                    <p className="text-sm text-muted-foreground">
                      <strong>Prioridades:</strong> {analysisResult.recommendations.priorities}
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {analysisResult.recommendations.suggestions.map(
                        (suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        )
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground italic border-t pt-4">
              <AlertTriangle className="h-3 w-3 mr-1 inline" />{' '}
              {analysisResult.disclaimer}
            </CardFooter>
          </Card>
        )}
      </div>
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={(isOpen) => !isOpen && setSelectedProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedProduct.productName}</DialogTitle>
              <DialogDescription>
                Análise detalhada do produto.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="col-span-1 text-sm text-muted-foreground">Estoque Restante</p>
                <p className="col-span-3 font-semibold">{selectedProduct.remainingQuantity} unidades</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="col-span-1 text-sm text-muted-foreground">Último Preço de Venda</p>
                <p className="col-span-3 font-semibold">{formatValue(selectedProduct.lastSalePrice)}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="col-span-1 text-sm text-muted-foreground">Lucro Potencial</p>
                <p className="col-span-3 font-semibold">{formatValue(selectedProduct.potentialProfit)}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="col-span-1 text-sm text-muted-foreground">Lucro Atual</p>
                <p className="col-span-3 font-semibold">{formatValue(selectedProduct.currentProfit)}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="col-span-1 text-sm text-muted-foreground">Prejuízo Total</p>
                <p className="col-span-3 font-semibold">{formatValue(selectedProduct.totalLoss)}</p>
              </div>
              {selectedProduct.totalLoss > 0 && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <p className="col-span-1 text-sm text-muted-foreground"></p>
                  <Button variant="link" className="col-span-3" onClick={() => setShowLosses(true)}>Ver detalhes do prejuízo</Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      {selectedProduct && showLosses && (
        <Dialog open={showLosses} onOpenChange={(isOpen) => !isOpen && setShowLosses(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Prejuízo - {selectedProduct.productName}</DialogTitle>
            </DialogHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor da Perda</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productLosses.map(loss => (
                  <TableRow key={loss.id}>
                    <TableCell>{new Date(loss.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{loss.quantitySold}</TableCell>
                    <TableCell>{formatValue(loss.saleValue)}</TableCell>
                    <TableCell>{loss.lossReason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      )}
    </TooltipProvider>
  );
}
