'use server';
/**
 * @fileOverview Provides AI-driven financial analysis and recommendations based on sales, product, and debt data.
 *
 * - analyzeFinances - Function to trigger the financial analysis flow.
 * - FinancialAnalysisInput - Input type for the analysis flow.
 * - FinancialAnalysisOutput - Output type for the analysis flow.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {Product, Sale, Debt, calculateUnitCost} from '@/types'; // Import existing types
import {getCurrencyConfig} from '@/config/currencies'; // Import currency config

// Simplified Zod schemas for flow input (can be derived from existing types if needed)
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  acquisitionValue: z.number(),
  quantity: z.number(),
  initialQuantity: z.number().optional(),
  createdAt: z.string().datetime(),
});

const SaleSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  quantitySold: z.number(),
  saleValue: z.number(),
  isLoss: z.boolean(),
  lossReason: z.string().optional(),
  profit: z.number(),
  createdAt: z.string().datetime(),
});

const DebtSchema = z.object({
  id: z.string(),
  type: z.enum(['receivable', 'payable']),
  description: z.string(),
  amount: z.number(),
  amountPaid: z.number(),
  dueDate: z.string().datetime().optional().nullable(),
  status: z.enum(['pending', 'paid', 'partially_paid']),
  contactName: z.string().optional(),
  createdAt: z.string().datetime(),
  paidAt: z.string().datetime().optional().nullable(),
  relatedSaleId: z.string().optional(),
});

export const FinancialAnalysisInputSchema = z.object({
  products: z.array(ProductSchema).describe('List of products in inventory.'),
  sales: z.array(SaleSchema).describe('List of sales and loss transactions.'),
  debts: z.array(DebtSchema).describe('List of debts (receivables and payables).'),
  currencyCode: z
    .string()
    .describe('The currency code (e.g., BRL, USD) used for financial values.'),
});
export type FinancialAnalysisInput = z.infer<
  typeof FinancialAnalysisInputSchema
>;

export const FinancialAnalysisOutputSchema = z.object({
  balanceSheetSummary: z.object({
    approxAssets: z
      .number()
      .describe(
        'Valor aproximado dos ativos (valor atual do estoque baseado no custo unitário).'
      ),
    approxLiabilities: z
      .number()
      .describe(
        'Valor aproximado dos passivos (total de dívidas a pagar pendentes).'
      ),
    approxNetWorth: z
      .number()
      .describe('Patrimônio líquido aproximado (Ativos - Passivos).'),
    summary: z.string().describe('Breve resumo da situação patrimonial.'),
  }),
  debtAnalysis: z.object({
    totalReceivablesPending: z
      .number()
      .describe('Valor total pendente a receber.'),
    totalPayablesPending: z.number().describe('Valor total pendente a pagar.'),
    analysis: z
      .string()
      .describe('Análise da situação das dívidas e potenciais problemas.'),
  }),
  riskAssessment: z.object({
    identifiedRisks: z
      .array(z.string())
      .describe(
        'Lista de riscos identificados (baseados em perdas, dívidas altas, baixo lucro, etc.).'
      ),
    assessment: z
      .string()
      .describe('Avaliação geral dos riscos para o negócio.'),
  }),
  recommendations: z.object({
    suggestions: z
      .array(z.string())
      .describe('Lista de recomendações acionáveis para melhorar a saúde financeira.'),
    priorities: z
      .string()
      .describe('Sugestão de prioridades ou próximos passos.'),
  }),
  overallStatus: z
    .enum(['healthy', 'needs_attention', 'critical'])
    .describe('Classificação geral da saúde financeira.'),
  disclaimer: z
    .string()
    .describe(
      'Aviso legal informando que a análise é baseada nos dados fornecidos e é uma aproximação.'
    ),
});
export type FinancialAnalysisOutput = z.infer<
  typeof FinancialAnalysisOutputSchema
>;

export async function analyzeFinances(
  input: FinancialAnalysisInput
): Promise<FinancialAnalysisOutput> {
  // Pre-calculate some values to potentially help the LLM or reduce token usage if complex
  const currencyConfig = getCurrencyConfig(input.currencyCode);
  const currencySymbol = currencyConfig?.symbol || input.currencyCode;

  // Note: The current report calculation in the store already does much of this.
  // We can pass those results or let the LLM derive them from raw data.
  // For simplicity here, we pass raw data and let the LLM perform the analysis based on instructions.

  // Calculate current stock value (Assets approximation)
  const approxAssets = input.products.reduce((total, product) => {
    const {cost: unitCost} = calculateUnitCost(product);
    const currentValue = unitCost * product.quantity;
    return total + currentValue;
  }, 0);

  // Calculate pending payables (Liabilities approximation)
  const approxLiabilities = input.debts.reduce((sum, debt) => {
    if (debt.type === 'payable' && debt.status !== 'paid') {
      return sum + (debt.amount - debt.amountPaid);
    }
    return sum;
  }, 0);

  const approxNetWorth = approxAssets - approxLiabilities;

  const totalReceivablesPending = input.debts.reduce((sum, debt) => {
    if (debt.type === 'receivable' && debt.status !== 'paid') {
      return sum + (debt.amount - debt.amountPaid);
    }
    return sum;
  }, 0);

  // Prepare data for the prompt (consider stringifying large arrays if needed)
  const promptData = {
    products: input.products,
    sales: input.sales,
    debts: input.debts,
    currencySymbol: currencySymbol,
    currencyCode: input.currencyCode,
    calculated: {
      // Pass pre-calculated values to help the LLM
      approxAssets,
      approxLiabilities,
      approxNetWorth,
      totalReceivablesPending,
      totalPayablesPending: approxLiabilities, // Same calculation
    },
  };

  const analysisResult = await financialAnalysisFlow(promptData);

  // Ensure the disclaimer is always added server-side for safety
  analysisResult.disclaimer =
    'Esta análise é gerada por IA e baseada exclusivamente nos dados fornecidos (produtos, vendas, dívidas). É uma ferramenta de apoio e não substitui aconselhamento financeiro profissional.';

  return analysisResult;
}

const prompt = ai.definePrompt({
  name: 'financialAnalysisPrompt',
  input: {
    schema: z.object({
      products: z.array(ProductSchema),
      sales: z.array(SaleSchema),
      debts: z.array(DebtSchema),
      currencySymbol: z.string(),
      currencyCode: z.string(),
      calculated: z.object({
        approxAssets: z.number(),
        approxLiabilities: z.number(),
        approxNetWorth: z.number(),
        totalReceivablesPending: z.number(),
        totalPayablesPending: z.number(),
      }),
    }),
  },
  output: {
    schema: FinancialAnalysisOutputSchema.omit({disclaimer: true}), // AI doesn't generate disclaimer
  },
  prompt: `Você é um consultor financeiro especialista em pequenos negócios. Analise os dados financeiros fornecidos para a aplicação "Vendas Tranquilas".

Dados Fornecidos:
- Moeda: {{{currencyCode}}} (Símbolo: {{{currencySymbol}}})
- Produtos (Estoque): {{json products}}
- Transações (Vendas e Perdas): {{json sales}}
- Dívidas (A Receber e A Pagar): {{json debts}}
- Cálculos Prévios: {{json calculated}}

Sua Tarefa:
Com base nos dados fornecidos, gere uma análise financeira detalhada no formato JSON especificado. Siga estritamente a estrutura de saída definida.

1.  **Resumo Patrimonial (Balance Sheet Summary):**
    *   Use os valores pré-calculados para ativos (estoque), passivos (dívidas a pagar) e patrimônio líquido.
    *   Escreva um breve resumo da situação, indicando se o patrimônio é positivo ou negativo e o que isso significa de forma simples.

2.  **Análise de Dívidas (Debt Analysis):**
    *   Use os valores pré-calculados para totais a receber e a pagar pendentes.
    *   Analise a proporção entre contas a receber e a pagar. Há risco de fluxo de caixa? Comente sobre a saúde das dívidas.

3.  **Avaliação de Riscos (Risk Assessment):**
    *   Identifique os principais riscos com base nos dados. Exemplos: alto volume de perdas em produtos específicos, lucro baixo ou negativo, dívidas a pagar muito altas comparadas às a receber, estoque parado (produtos sem vendas recentes - inferir se possível), dependência de poucos produtos rentáveis.
    *   Forneça uma avaliação geral (ex: baixo, moderado, alto risco).

4.  **Recomendações (Recommendations):**
    *   Sugira ações concretas e práticas para o usuário. Exemplos: renegociar dívidas a pagar, focar em produtos mais rentáveis, estratégias para reduzir perdas, promoções para limpar estoque parado, melhorar controle de contas a receber.
    *   Indique quais ações seriam mais prioritárias.

5.  **Status Geral (Overall Status):**
    *   Classifique a saúde financeira geral como 'healthy', 'needs_attention', ou 'critical'.

Seja claro, objetivo e use uma linguagem acessível para um pequeno empreendedor. Baseie TODA a análise **exclusivamente** nos dados fornecidos. Não invente informações. Se os dados forem insuficientes para alguma parte da análise, mencione isso.`,
});

const financialAnalysisFlow = ai.defineFlow(
  {
    name: 'financialAnalysisFlow',
    inputSchema: prompt.inputSchema!, // Use the prompt's input schema
    outputSchema: FinancialAnalysisOutputSchema.omit({disclaimer: true}), // Match prompt output
  },
  async input => {
    const {output} = await prompt(input);
    return output!; // Assuming output is guaranteed based on schema request
  }
);
