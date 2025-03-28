// app/dashboard/@profit/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { fetchProfitData } from "../__actions/cardsActions";

export default async function ProfitCard() {
  const { netProfit, profitChange, monthlyData } = await fetchProfitData();
  
  return (
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-[#ecfdf5] to-white">
      <CardHeader className="pb-2 pt-6">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span className="text-[#0f172a]">Net Profit</span>
          <div className="h-10 w-10 rounded-full bg-[#22c55e20] flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-[#22c55e]" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <p className="text-3xl font-bold text-[#0f172a]">
            ${netProfit.toLocaleString()}
          </p>
          
          {/* Monthly Bar Chart */}
          <div className="mt-4 h-24 flex items-end justify-between">
            {monthlyData.map((month, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-6 rounded-t-sm bg-[#22c55e]" 
                  style={{ 
                    height: `${(month.value / Math.max(...monthlyData.map(m => m.value))) * 80}%`,
                    opacity: month.value < 0 ? 0.5 : 1
                  }}
                />
                <span className="text-xs text-[#64748b] mt-1">{month.name}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${profitChange >= 0 ? 'text-[#22c55e]' : 'text-[#f43f5e]'}`}>
              {profitChange >= 0 ? '+' : ''}{profitChange}%
            </span>
            <span className="text-sm text-[#64748b] ml-2">since last quarter</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
