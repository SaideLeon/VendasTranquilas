import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { transactions } from "@/lib/data";
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Header } from "@/components/header";

export default function DashboardPage() {
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
    
  const netBalance = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  const chartData = [
    { name: "Jan", income: 4000, expense: 2400 },
    { name: "Fev", income: 3000, expense: 1398 },
    { name: "Mar", income: 5000, expense: 9800 },
    { name: "Abr", income: 2780, expense: 3908 },
    { name: "Mai", income: 1890, expense: 4800 },
    { name: "Jun", income: 2390, expense: 3800 },
    { name: "Jul", income: totalIncome, expense: totalExpenses },
  ];
  
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="flex flex-1 flex-col">
      <Header title="Dashboard" />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <OverviewCards 
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          netBalance={netBalance}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Fluxo de Caixa</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <CashFlowChart data={chartData} />
            </CardContent>
          </Card>
          <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>
                Você tem {transactions.length} transações no total.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentTransactions transactions={recentTransactions} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
