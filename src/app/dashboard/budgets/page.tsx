 
import { budgets } from "@/lib/data";
import { BudgetCard } from "@/components/budgets/budget-card";
import { BudgetDialog } from "@/components/budgets/budget-dialog";

export default function BudgetsPage() {
  return (
    <div className="flex flex-1 flex-col"> 
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Seus Orçamentos
          </h2>
          <BudgetDialog />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
          {budgets.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
              <p>Você ainda não criou nenhum orçamento.</p>
              <p>Clique em "Novo Orçamento" para começar.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
