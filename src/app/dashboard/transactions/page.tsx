import { DataTable } from "@/components/transactions/data-table";
import { columns } from "@/components/transactions/columns";
import { transactions } from "@/lib/data";
import { AddTransactionSheet } from "@/components/transactions/add-transaction-sheet";
import { Card, CardContent } from "@/components/ui/card";

export default function TransactionsPage() {
  const data = transactions;

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Transações
          </h2>
          <AddTransactionSheet />
        </div>
        <Card>
            <CardContent className="p-0">
                <DataTable columns={columns} data={data} />
            </CardContent>
        </Card> 
    </div>
  );
}
