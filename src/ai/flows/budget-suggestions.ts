// budget-suggestions.ts
'use server';

/**
 * @fileOverview Provides budget suggestions based on past spending habits.
 *
 * This file defines a Genkit flow that suggests budget amounts for different categories
 * based on a user's transaction history.
 *
 * @exports {
 *   suggestBudgets - A function to trigger the budget suggestion flow.
 *   BudgetSuggestionsInput - The input type for the suggestBudgets function.
 *   BudgetSuggestionsOutput - The output type for the suggestBudgets function.
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Input schema for the budget suggestion flow.
 */
const BudgetSuggestionsInputSchema = z.object({
  transactionHistory: z.string().describe(
    'A detailed transaction history of the user, including amounts and categories.'
  ),
});

export type BudgetSuggestionsInput = z.infer<typeof BudgetSuggestionsInputSchema>;

/**
 * Output schema for the budget suggestion flow.
 */
const BudgetSuggestionsOutputSchema = z.object({
  suggestedBudgets: z.string().describe(
    'A JSON string containing suggested budget amounts for each category.'
  ),
});

export type BudgetSuggestionsOutput = z.infer<typeof BudgetSuggestionsOutputSchema>;

/**
 * Wrapper function to trigger the budget suggestion flow.
 * @param input - The input containing transaction history.
 * @returns A promise resolving to the budget suggestions.
 */
export async function suggestBudgets(input: BudgetSuggestionsInput): Promise<BudgetSuggestionsOutput> {
  return budgetSuggestionsFlow(input);
}

const budgetSuggestionsPrompt = ai.definePrompt({
  name: 'budgetSuggestionsPrompt',
  input: {schema: BudgetSuggestionsInputSchema},
  output: {schema: BudgetSuggestionsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the following transaction history and suggest a monthly budget for each category.

Transaction History:
{{{transactionHistory}}}

Provide the suggestions in a JSON format with category names as keys and suggested budget amounts as values.
{
  "category1": amount,
  "category2": amount,
  ...
}`,
});

/**
 * Genkit flow for suggesting budget amounts based on transaction history.
 */
const budgetSuggestionsFlow = ai.defineFlow(
  {
    name: 'budgetSuggestionsFlow',
    inputSchema: BudgetSuggestionsInputSchema,
    outputSchema: BudgetSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await budgetSuggestionsPrompt(input);
    return output!;
  }
);
