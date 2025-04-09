import { Card, CardContent } from "@/components/ui/card";
import { IncomeExpenseChartComponent } from "../__components/IncomeExpenseChartComponent";

export default function IncomeExpensePage() {
  return (
    <Card className="border-0 shadow-none p-2">
      <CardContent className="p-0 space-y-6">
        <IncomeExpenseChartComponent />
      </CardContent>
    </Card>
  );
}
