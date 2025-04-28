'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/store';
import {
  analyzeFinances,
  type FinancialAnalysisOutput,
} from '@/ai/flows/financial-analysis-flow';
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
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency-utils';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip'; // Ensure correct import

export default function InsightsPage() {
  const { products, sales, debts, currency } = useStore();
  const [analysisResult, setAnalysisResult] =
    useState<FinancialAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await analyzeFinances({
        products,
        sales,
        debts,
        currencyCode: currency,
      });
      setAnalysisResult(result);
    } catch (err) {
      console.error('Financial analysis failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao gerar a análise.'
      );
    } finally {
      setIsLoading(false);
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

  return (
    <TooltipProvider> {/* Wrap the entire content */}
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
          <CardContent>
            <Button onClick={handleAnalyze} disabled={isLoading}>
              {isLoading ? 'Analisando...' : 'Gerar Análise Financeira'}
            </Button>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erro na Análise</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {isLoading && (
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

        {analysisResult && !isLoading && (
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resultado da Análise</span>
                <Badge
                  variant="outline"
                  className={`border ${getStatusProps(analysisResult.overallStatus).color
                    }`}
                >
                  <getStatusProps(analysisResult.overallStatus).icon className="h-4 w-4 mr-1" />
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
              <Accordion type="multiple" defaultValue={['balance', 'risks', 'recommendations']} className="w-full">
                {/* Balance Sheet */}
                <AccordionItem value="balance">
                  <AccordionTrigger className="text-lg font-semibold">
                    <Scale className="h-5 w-5 mr-2" /> Resumo Patrimonial
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pl-2">
                    <p className="text-sm text-muted-foreground">
                      {analysisResult.balanceSheetSummary.summary}
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
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
                        <p className="text-xs text-muted-foreground">Patrimônio Líq.</p>
                        <p className={`font-bold ${analysisResult.balanceSheetSummary.approxNetWorth >= 0 ? 'text-primary-foreground' : 'text-destructive'}`}>
                          {formatValue(analysisResult.balanceSheetSummary.approxNetWorth)}
                        </p>
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
    </TooltipProvider> // Ensure TooltipProvider is closed correctly
  );
}
