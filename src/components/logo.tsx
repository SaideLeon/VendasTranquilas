import { PiggyBank } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <PiggyBank className="h-7 w-7 text-primary" />
      <h1 className="text-xl font-bold text-primary/90">SIGEF</h1>
    </div>
  );
}
