// app/dashboard/financial/page.tsx
import { Card, CardContent } from "@/components/ui/card";
import ExpenseCard from "../__components/ExpenseCard";

export default function FinancialOverviewPage() {
  return (
    <Card className="border-0 shadow-none p-2">
      <CardContent className="p-0 space-y-6">
        <ExpenseCard />
      </CardContent>
    </Card>
  );
}
