import { Header } from "@/components/header";
import { DataTable } from "@/components/transactions/data-table";
import { columns } from "@/components/transactions/columns";
import { transactions } from "@/lib/data";
import { AddTransactionSheet } from "@/components/transactions/add-transaction-sheet";

export default function TransactionsPage() {
  const data = transactions;

  return (
    <div className="flex flex-1 flex-col">
      <Header title="Transações" />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Histórico de Transações
          </h2>
          <AddTransactionSheet />
        </div>
        <DataTable columns={columns} data={data} />
      </main>
    </div>
  );
}
