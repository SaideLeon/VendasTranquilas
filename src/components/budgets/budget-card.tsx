import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Budget } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function BudgetCard({ budget }: { budget: Budget }) {
  const progress = (budget.spent / budget.limit) * 100;
  const isOverBudget = progress > 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{budget.category}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span
              className={cn(
                "font-medium",
                isOverBudget ? "text-red-500" : "text-muted-foreground"
              )}
            >
              {formatCurrency(budget.spent)}
            </span>
            <span className="text-muted-foreground">
              / {formatCurrency(budget.limit)}
            </span>
          </div>
          <Progress value={Math.min(progress, 100)} className={cn(isOverBudget && "[&>div]:bg-red-500")} />
          <p className="text-xs text-muted-foreground">
            {isOverBudget
              ? `${formatCurrency(budget.spent - budget.limit)} acima do orçamento`
              : `${formatCurrency(budget.limit - budget.spent)} restante`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
