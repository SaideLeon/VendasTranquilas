export type Transaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: Category;
};

export type Category =
  | "Receita"
  | "Moradia"
  | "Alimentação"
  | "Transporte"
  | "Saúde"
  | "Educação"
  | "Lazer"
  | "Vestuário"
  | "Dívidas"
  | "Investimentos"
  | "Outros";

export const ExpenseCategories: Category[] = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Vestuário",
  "Dívidas",
  "Investimentos",
  "Outros",
];

export const IncomeCategories: Category[] = ["Receita", "Investimentos", "Outros"];

export type Budget = {
  id: string;
  category: Category;
  limit: number;
  spent: number;
};
