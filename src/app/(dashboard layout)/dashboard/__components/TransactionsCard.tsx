// app/dashboard/@transactions/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4 } from "lucide-react";
import { fetchAllTransactions } from "../__actions/cardsActions";

export default async function TransactionsCard() {
  const { recentCount, weeklyData } = await fetchAllTransactions();

  return (
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-[#e0f2fe] to-white">
      <CardHeader className="pb-2 pt-6">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span className="text-[#0f172a]">Recent Transactions</span>
          <div className="h-10 w-10 rounded-full bg-[#0ea5e920] flex items-center justify-center">
            <BarChart4 className="h-5 w-5 text-[#0ea5e9]" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <p className="text-3xl font-bold text-[#0f172a]">{recentCount}</p>

          {/* Weekly Activity */}
          <div className="mt-4">
            <div className="grid grid-cols-7 gap-1 h-16">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className="w-full rounded-sm bg-[#0ea5e9]"
                      style={{
                        height: `${(day.count / Math.max(...weeklyData.map((d) => d.count))) * 100}%`,
                        opacity: day.isToday ? 1 : 0.5,
                      }}
                    />
                  </div>
                  <span className="text-xs text-[#64748b] mt-1">
                    {day.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Types */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex items-center p-2 rounded-md bg-[#ecfdf5]">
              <div className="h-8 w-8 rounded-full bg-[#22c55e20] flex items-center justify-center mr-3">
                <div className="h-3 w-3 rounded-full bg-[#22c55e]" />
              </div>
              <div>
                <p className="text-xs text-[#64748b]">Income</p>
                <p className="text-sm font-medium text-[#0f172a]">
                  {weeklyData
                    .reduce((sum, day) => sum + day.income, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center p-2 rounded-md bg-[#fff1f2]">
              <div className="h-8 w-8 rounded-full bg-[#f43f5e20] flex items-center justify-center mr-3">
                <div className="h-3 w-3 rounded-full bg-[#f43f5e]" />
              </div>
              <div>
                <p className="text-xs text-[#64748b]">Expense</p>
                <p className="text-sm font-medium text-[#0f172a]">
                  {weeklyData
                    .reduce((sum, day) => sum + day.expense, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
