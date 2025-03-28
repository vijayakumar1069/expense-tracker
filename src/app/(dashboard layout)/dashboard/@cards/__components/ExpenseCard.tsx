// app/dashboard/@expense/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight } from "lucide-react";
import { fetchExpenseData } from "../__actions/cardsActions";

export default async function ExpenseCard() {
  const { totalExpense, topExpenseCategories } = await fetchExpenseData();
  
  return (
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-[#fff1f2] to-white">
      <CardHeader className="pb-2 pt-6">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span className="text-[#0f172a]">Total Expense</span>
          <div className="h-10 w-10 rounded-full bg-[#f43f5e20] flex items-center justify-center">
            <ArrowDownRight className="h-5 w-5 text-[#f43f5e]" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <p className="text-3xl font-bold text-[#0f172a]">
            ${totalExpense.toLocaleString()}
          </p>
          
          {/* Expense Breakdown - Horizontal Bars */}
          <div className="mt-4 space-y-2">
            {topExpenseCategories.map((category, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748b]">{category.name}</span>
                  <span className="font-medium text-[#0f172a]">{category.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${category.percentage}%`,
                      backgroundColor: category.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-2">
            <span className="text-sm text-[#6366f1] font-medium cursor-pointer hover:underline">View all categories</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
