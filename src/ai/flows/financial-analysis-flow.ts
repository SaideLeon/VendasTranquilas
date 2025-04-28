'use server';
/**
 * @fileOverview Provides AI-driven financial analysis and recommendations based on sales, product, and debt data.
 *
 * - analyzeFinances - Function to trigger the financial analysis flow.
 * - FinancialAnalysisInput - Input type for the analysis flow (used by the exported function).
 * - FinancialAnalysisOutput - Output type for the analysis flow.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {Product, Sale, Debt, calculateUnitCost} from '@/types';
import {getCurrencyConfig} from '@/config/currencies';

// Simplified Zod schemas for data types used in the application
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  acquisitionValue: z.number(),
  quantity: z.number(),
  initialQuantity: z.number().optional(), // Keep optional for flexibility if older data exists
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
  profit: z.number(), // Profit can be negative for losses
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

// Input schema for the main exported function `analyzeFinances`
export const FinancialAnalysisInputSchema = z.object({
  products: z.array(ProductSchema),
  sales: z.array(SaleSchema),
  debts: z.array(DebtSchema),
  currencyCode: z.string(),
});
export type FinancialAnalysisInput = z.infer<typeof FinancialAnalysisInputSchema>;

// Input schema specifically for the AI prompt (includes calculated values)
const FinancialAnalysisPromptInputSchema = z.object({
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
});
type FinancialAnalysisPromptInput = z.infer<typeof FinancialAnalysisPromptInputSchema>;


// Output schema for both the flow and the exported function
export const FinancialAnalysisOutputSchema = z.object({
  balanceSheetSummary: z.object({
    approxAssets: z.number().describe('Estimated total value of assets, primarily current stock value.'),
    approxLiabilities: z.number().describe('Estimated total value of pending liabilities (debts to pay).'),
    approxNetWorth: z.number().describe('Estimated net worth (Assets - Liabilities).'),
    summary: z.string().describe('A brief textual summary of the balance sheet situation.'),
  }),
  debtAnalysis: z.object({
    totalReceivablesPending: z.number().describe('Total amount pending to be received from customers/debtors.'),
    totalPayablesPending: z.number().describe('Total amount pending to be paid to suppliers/creditors.'),
    analysis: z.string().describe('Textual analysis of the debt situation, including cash flow implications.'),
  }),
  riskAssessment: z.object({
    identifiedRisks: z.array(z.string()).describe('A list of potential financial or operational risks identified from the data.'),
    assessment: z.string().describe('Overall assessment of the risk level (e.g., low, moderate, high).'),
  }),
  recommendations: z.object({
    suggestions: z.array(z.string()).describe('Actionable suggestions for improvement based on the analysis.'),
    priorities: z.string().describe('Indication of which recommendations should be prioritized.'),
  }),
  overallStatus: z.enum(['healthy', 'needs_attention', 'critical']).describe('Overall financial health status.'),
  disclaimer: z.string().describe('Standard disclaimer about the AI-generated nature of the analysis.'),
});
export type FinancialAnalysisOutput = z.infer<typeof FinancialAnalysisOutputSchema>;


/**
 * Prepares data and calls the Genkit flow for financial analysis.
 * @param input - The raw product, sale, and debt data along with currency code.
 * @returns A promise that resolves to the financial analysis output.
 */
export async function analyzeFinances(
  input: FinancialAnalysisInput
): Promise<FinancialAnalysisOutput> {
  const currencyConfig = getCurrencyConfig(input.currencyCode);
  const currencySymbol = currencyConfig?.symbol || input.currencyCode;

  // Calculate approximate asset value (current stock value)
  const approxAssets = input.products.reduce((total, product) => {
    const { cost: unitCost } = calculateUnitCost(product);
    // Use current quantity for stock value
    return total + (unitCost * product.quantity);
  }, 0);

  // Calculate approximate liabilities (pending payables)
  const approxLiabilities = input.debts.reduce((sum, debt) => {
    if (debt.type === 'payable' && debt.status !== 'paid') {
      return sum + (debt.amount - debt.amountPaid);
    }
    return sum;
  }, 0);

  const approxNetWorth = approxAssets - approxLiabilities;

  // Calculate total pending receivables
  const totalReceivablesPending = input.debts.reduce((sum, debt) => {
    if (debt.type === 'receivable' && debt.status !== 'paid') {
      return sum + (debt.amount - debt.amountPaid);
    }
    return sum;
  }, 0);

  // Prepare data for the prompt, including calculated values
  const promptData: FinancialAnalysisPromptInput = {
    products: input.products,
    sales: input.sales,
    debts: input.debts,
    currencySymbol,
    currencyCode: input.currencyCode,
    calculated: {
      approxAssets,
      approxLiabilities, // This is totalPayablesPending
      approxNetWorth,
      totalReceivablesPending,
      totalPayablesPending: approxLiabilities, // Reuse calculated liabilities
    },
  };

  // Call the Genkit flow
  return financialAnalysisFlow(promptData);
}

// Define the Genkit prompt (internal - DO NOT EXPORT)
const prompt = ai.definePrompt({
  name: 'financialAnalysisPrompt',
  input: {
    schema: FinancialAnalysisPromptInputSchema, // Use the specific prompt input schema
  },
  output: {
     // Define the expected output structure for the prompt (excluding the disclaimer)
    schema: FinancialAnalysisOutputSchema.omit({disclaimer: true}),
  },
  prompt: `Você é um consultor financeiro especialista em pequenos negócios. Analise os dados financeiros fornecidos para a aplicação "Vendas Tranquilas".

Dados Fornecidos:
- Moeda: {{{currencyCode}}} (Símbolo: {{{currencySymbol}}})
- Produtos (Estoque Atual): {{json products}}
- Transações (Vendas e Perdas): {{json sales}}
- Dívidas (A Receber e A Pagar): {{json debts}}
- Cálculos Prévios (Aproximados): {{json calculated}}
  - approxAssets: Valor estimado do estoque atual.
  - approxLiabilities: Total de dívidas a pagar pendentes.
  - approxNetWorth: Patrimônio líquido estimado (Ativos - Passivos).
  - totalReceivablesPending: Total de dívidas a receber pendentes.
  - totalPayablesPending: Total de dívidas a pagar pendentes (igual a approxLiabilities).

Sua Tarefa:
Com base nos dados fornecidos, gere uma análise financeira detalhada no formato JSON especificado. Siga estritamente a estrutura de saída definida (omitindo o campo 'disclaimer').

1.  **Resumo Patrimonial (balanceSheetSummary):**
    *   Use os valores pré-calculados para 'approxAssets', 'approxLiabilities', e 'approxNetWorth'.
    *   Escreva um 'summary' breve da situação, indicando se o patrimônio é positivo ou negativo e o que isso significa de forma simples.

2.  **Análise de Dívidas (debtAnalysis):**
    *   Use os valores pré-calculados 'totalReceivablesPending' e 'totalPayablesPending'.
    *   Analise a proporção entre contas a receber e a pagar no campo 'analysis'. Há risco de fluxo de caixa? Comente sobre a saúde das dívidas.

3.  **Avaliação de Riscos (riskAssessment):**
    *   Identifique os principais riscos ('identifiedRisks') com base nos dados. Exemplos: alto volume de perdas em produtos específicos, lucro baixo ou negativo, dívidas a pagar muito altas comparadas às a receber, estoque parado (produtos sem vendas recentes - inferir se possível), dependência de poucos produtos rentáveis.
    *   Forneça uma 'assessment' geral (ex: baixo, moderado, alto risco).

4.  **Recomendações (recommendations):**
    *   Sugira ações concretas e práticas ('suggestions') para o usuário. Exemplos: renegociar dívidas a pagar, focar em produtos mais rentáveis, estratégias para reduzir perdas, promoções para limpar estoque parado, melhorar controle de contas a receber.
    *   Indique quais ações seriam mais prioritárias em 'priorities'.

5.  **Status Geral (overallStatus):**
    *   Classifique a saúde financeira geral como 'healthy', 'needs_attention', ou 'critical'.

Seja claro, objetivo e use uma linguagem acessível para um pequeno empreendedor. Baseie TODA a análise **exclusivamente** nos dados fornecidos. Não invente informações. Se os dados forem insuficientes para alguma parte da análise, mencione isso explicitamente no texto correspondente (summary, analysis, assessment, recommendations).`,
});

// Define the Genkit flow (internal - DO NOT EXPORT)
// Use the specific Prompt Input Schema and the full Output Schema
const financialAnalysisFlow = ai.defineFlow<
    FinancialAnalysisPromptInput,
    FinancialAnalysisOutput
>({
    name: 'financialAnalysisFlow',
    inputSchema: FinancialAnalysisPromptInputSchema, // Reference the specific prompt input schema
    outputSchema: FinancialAnalysisOutputSchema,     // Reference the full output schema
}, async (input) => {
    // Call the prompt with the prepared input data
    const { output } = await prompt(input);

    // Combine the AI output with the standard disclaimer
    return {
        ...output!, // Use non-null assertion as output is expected based on schema
        disclaimer: 'Esta análise é gerada por IA e baseada exclusivamente nos dados fornecidos (produtos, vendas, dívidas). É uma ferramenta de apoio e não substitui aconselhamento financeiro profissional.',
    };
});

