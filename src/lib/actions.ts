"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { transactions, budgets } from "./data";
import {
  categorizeTransaction,
  CategorizeTransactionInput,
} from "@/ai/flows/transaction-auto-categorization";
import {
  suggestBudgets,
  BudgetSuggestionsInput,
} from "@/ai/flows/budget-suggestions";
import type { Budget, Category } from "./types";
import { ExpenseCategories } from "./types";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  description: z.string().min(1, "Descrição é obrigatória."),
  amount: z.coerce.number().positive("Valor deve ser positivo."),
  date: z.coerce.date(),
  category: z.string().min(1, "Categoria é obrigatória."),
});

export async function addTransactionAction(formData: FormData) {
  const validatedFields = transactionSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { type, description, amount, date, category } = validatedFields.data;

  const newTransaction = {
    id: Date.now().toString(),
    type,
    description,
    amount,
    date,
    category: category as Category,
  };

  transactions.unshift(newTransaction);

  const budgetToUpdate = budgets.find((b) => b.category === category);
  if (budgetToUpdate && type === "expense") {
    budgetToUpdate.spent += amount;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard/reports");

  return { message: "Transação adicionada com sucesso." };
}

export async function getCategorySuggestion(
  description: string
): Promise<{ category?: string; error?: string }> {
  if (!description) {
    return { error: "Descrição está vazia." };
  }
  try {
    const transactionHistory = transactions
      .slice(0, 5)
      .map((t) => `${t.description} -> ${t.category}`)
      .join("\n");

    const input: CategorizeTransactionInput = {
      transactionDescription: description,
      transactionHistory,
    };
    const result = await categorizeTransaction(input);

    if (ExpenseCategories.includes(result.category as Category)) {
       return { category: result.category };
    }
    return { category: "Outros" };

  } catch (error) {
    console.error(error);
    return { error: "Falha ao sugerir categoria." };
  }
}

const budgetSchema = z.object({
  category: z.string().min(1, "Categoria é obrigatória."),
  limit: z.coerce.number().positive("Limite deve ser um valor positivo."),
});

export async function addBudgetAction(formData: FormData) {
  const validatedFields = budgetSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { category, limit } = validatedFields.data;

  const existingBudget = budgets.find((b) => b.category === category);

  if (existingBudget) {
    return {
      errors: {
        category: ["Orçamento para esta categoria já existe."],
      },
    };
  }

  const newBudget: Budget = {
    id: Date.now().toString(),
    category: category as Category,
    limit,
    spent: transactions
      .filter((t) => t.category === category && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0),
  };

  budgets.push(newBudget);

  revalidatePath("/dashboard/budgets");

  return { message: "Orçamento criado com sucesso." };
}

export async function getBudgetSuggestions(): Promise<{ suggestions?: Record<string, number>; error?: string }> {
  try {
    const transactionHistory = transactions
      .filter((t) => t.type === "expense")
      .map((t) => `${t.date.toISOString().split('T')[0]}: ${t.description} - ${t.amount} (${t.category})`)
      .join("\n");

    if (!transactionHistory) {
      return { suggestions: {} };
    }

    const input: BudgetSuggestionsInput = { transactionHistory };
    const result = await suggestBudgets(input);
    const suggestions = JSON.parse(result.suggestedBudgets);

    return { suggestions };
  } catch (error) {
    console.error(error);
    return { error: "Falha ao obter sugestões de orçamento." };
  }
}
