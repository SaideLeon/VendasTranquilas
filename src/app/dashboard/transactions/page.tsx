 
import { DataTable } from "@/components/transactions/data-table";
import { columns } from "@/components/transactions/columns";
import { transactions } from "@/lib/data";
import { AddTransactionSheet } from "@/components/transactions/add-transaction-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionsPage() {
  const data = transactions;

  return (
    <div className="flex flex-1 flex-col"> 
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Histórico de Transações
          </h2>
          <AddTransactionSheet />
        </div>
        <Card>
            <CardContent className="p-0">
                <DataTable columns={columns} data={data} />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
