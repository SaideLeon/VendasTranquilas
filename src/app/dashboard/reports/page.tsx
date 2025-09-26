import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { CategorySpendingChart } from "@/components/reports/category-spending-chart";
import { transactions } from "@/lib/data";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";

export default function ReportsPage() {
    const now = new Date();
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const lastMonthTransactions = transactions.filter(
        (t) => t.date >= lastMonthStart && t.date <= lastMonthEnd
    );

    const totalIncome = lastMonthTransactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpenses = lastMonthTransactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + t.amount, 0);

    const cashFlowChartData = [
        { name: "Jan", income: 4000, expense: 2400 },
        { name: "Fev", income: 3000, expense: 1398 },
        { name: "Mar", income: 5000, expense: 9800 },
        { name: "Abr", income: 2780, expense: 3908 },
        { name: "Mai", income: 1890, expense: 4800 },
        { name: "Jun", income: 2390, expense: 3800 },
        { name: "Jul", income: totalIncome, expense: totalExpenses },
      ];

      const categorySpendingData = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            const existing = acc.find(item => item.name === t.category);
            if(existing) {
                existing.value += t.amount;
            } else {
                acc.push({ name: t.category, value: t.amount });
            }
            return acc;
        }, [] as { name: string; value: number }[])
        .sort((a,b) => b.value - a.value)
        .slice(0, 5);


  return (
    <div className="flex flex-1 flex-col">
      <Header title="Relatórios" />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Fluxo de Caixa Mensal</CardTitle>
                    <CardDescription>Receitas vs. Despesas ao longo do tempo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CashFlowChart data={cashFlowChartData} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Despesas por Categoria</CardTitle>
                    <CardDescription>Distribuição das suas despesas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CategorySpendingChart data={categorySpendingData} />
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
