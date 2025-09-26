import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function RecentTransactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="hidden sm:table-cell">Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>
              <div className="font-medium">{transaction.description}</div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{transaction.category}</Badge>
            </TableCell>
            <TableCell
              className={cn(
                "text-right",
                transaction.type === "income"
                  ? "text-green-600"
                  : "text-red-600"
              )}
            >
              {transaction.type === "income" ? "" : "-"}
              {formatCurrency(transaction.amount)}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {formatDate(transaction.date)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
