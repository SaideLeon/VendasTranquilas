import type { Transaction, Budget, Category } from "./types";

export const transactions: Transaction[] = [
  {
    id: "1",
    date: new Date("2024-07-01"),
    description: "Salário",
    amount: 5000,
    type: "income",
    category: "Receita",
  },
  {
    id: "2",
    date: new Date("2024-07-01"),
    description: "Aluguel",
    amount: 1500,
    type: "expense",
    category: "Moradia",
  },
  {
    id: "3",
    date: new Date("2024-07-03"),
    description: "Supermercado Pão de Açúcar",
    amount: 350.75,
    type: "expense",
    category: "Alimentação",
  },
  {
    id: "4",
    date: new Date("2024-07-05"),
    description: "Gasolina Posto Ipiranga",
    amount: 150,
    type: "expense",
    category: "Transporte",
  },
  {
    id: "5",
    date: new Date("2024-07-10"),
    description: "Cinema - Ingresso",
    amount: 45,
    type: "expense",
    category: "Lazer",
  },
  {
    id: "6",
    date: new Date("2024-07-12"),
    description: "Restaurante Coco Bambu",
    amount: 280.5,
    type: "expense",
    category: "Alimentação",
  },
    {
    id: "7",
    date: new Date("2024-06-15"),
    description: "Farmácia",
    amount: 80,
    type: "expense",
    category: "Saúde",
  },
  {
    id: "8",
    date: new Date("2024-06-20"),
    description: "Venda de item usado",
    amount: 200,
    type: "income",
    category: "Outros",
  },
];

export const budgets: Budget[] = [
  {
    id: "1",
    category: "Alimentação",
    limit: 1000,
    spent: transactions
      .filter((t) => t.category === "Alimentação" && t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0),
  },
  {
    id: "2",
    category: "Transporte",
    limit: 400,
    spent: transactions
      .filter((t) => t.category === "Transporte" && t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0),
  },
  {
    id: "3",
    category: "Lazer",
    limit: 500,
    spent: transactions
      .filter((t) => t.category === "Lazer" && t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0),
  },
];
