/**
 * @fileOverview Type definitions and Zod schemas for the financial analysis AI flow.
 */

import { z } from 'zod';
import type { Product, Sale, Debt } from '@/types'; // Import base types if needed

// Simplified Zod schemas for data types used in the application (can be imported from '@/types' if schemas are defined there)
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

// Input schema for the main exported function `analyzeFinances`
export const FinancialAnalysisInputSchema = z.object({
  products: z.array(ProductSchema),
  sales: z.array(SaleSchema),
  debts: z.array(DebtSchema),
  currencyCode: z.string(),
});
export type FinancialAnalysisInput = z.infer<typeof FinancialAnalysisInputSchema>;

// Input schema specifically for the AI prompt (includes calculated values)
export const FinancialAnalysisPromptInputSchema = z.object({
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
export type FinancialAnalysisPromptInput = z.infer<typeof FinancialAnalysisPromptInputSchema>;


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
