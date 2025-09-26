'use server';
/**
 * @fileOverview An AI agent that automatically categorizes transactions based on their descriptions.
 *
 * - categorizeTransaction - A function that handles the transaction categorization process.
 * - CategorizeTransactionInput - The input type for the categorizeTransaction function.
 * - CategorizeTransactionOutput - The return type for the categorizeTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTransactionInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('The description of the transaction.'),
  transactionHistory: z
    .string()
    .optional()
    .describe('The transaction history of the user.'),
});
export type CategorizeTransactionInput = z.infer<typeof CategorizeTransactionInputSchema>;

const CategorizeTransactionOutputSchema = z.object({
  category: z
    .string()
    .describe('The predicted category of the transaction.'),
  confidence: z
    .number()
    .optional()
    .describe('The confidence level of the category prediction (0-1).'),
});
export type CategorizeTransactionOutput = z.infer<typeof CategorizeTransactionOutputSchema>;

export async function categorizeTransaction(
  input: CategorizeTransactionInput
): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: {schema: CategorizeTransactionInputSchema},
  output: {schema: CategorizeTransactionOutputSchema},
  prompt: `You are a personal finance assistant that helps categorize user transactions.

  The user will provide a description of the transaction, and optionally their transaction history.
  You will respond with the most likely category for the transaction.

  Transaction Description: {{{transactionDescription}}}
  Transaction History: {{{transactionHistory}}}
  Response:
  {
    "category": "[predicted category]",
    "confidence": "[confidence level between 0 and 1]"
  }`,
});

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
