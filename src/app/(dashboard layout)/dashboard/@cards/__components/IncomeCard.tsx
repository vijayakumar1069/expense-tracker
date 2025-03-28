// app/dashboard/@income/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { fetchIncomeData } from "../__actions/cardsActions";

export default async function IncomeCard() {
  const { totalIncome, incomeChange } = await fetchIncomeData();
  
  return (
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-[#eef2ff] to-white">
      <CardHeader className="pb-2 pt-6">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span className="text-[#0f172a]">Total Income</span>
          <div className="h-10 w-10 rounded-full bg-[#6366f140] flex items-center justify-center">
            <ArrowUpRight className="h-5 w-5 text-[#6366f1]" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <p className="text-3xl font-bold text-[#0f172a]">
            ${totalIncome.toLocaleString()}
          </p>
          
          <div className="mt-4 relative h-24">
            {/* Income Trend Visualization - Gradient Area Chart */}
            <div className="absolute inset-0">
              <svg viewBox="0 0 100 40" className="w-full h-full">
                <defs>
                  <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Area */}
                <path 
                  d="M0,35 L10,30 L20,33 L30,25 L40,28 L50,20 L60,15 L70,18 L80,10 L90,5 L100,8 L100,40 L0,40 Z" 
                  fill="url(#incomeGradient)" 
                />
                
                {/* Line */}
                <path 
                  d="M0,35 L10,30 L20,33 L30,25 L40,28 L50,20 L60,15 L70,18 L80,10 L90,5 L100,8" 
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="1.5" 
                />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${incomeChange >= 0 ? 'text-[#22c55e]' : 'text-[#f43f5e]'}`}>
              {incomeChange >= 0 ? '+' : ''}{incomeChange}%
            </span>
            <span className="text-sm text-[#64748b] ml-2">vs last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
