// app/dashboard/@clients/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { fetchClientData } from "../__actions/cardsActions";

export default async function ClientsCard() {
  const { activeClients, recentClients, changeRate } = await fetchClientData();
  
  return (
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-[#f3e8ff] to-white">
      <CardHeader className="pb-2 pt-6">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span className="text-[#0f172a]">Active Clients</span>
          <div className="h-10 w-10 rounded-full bg-[#8b5cf620] flex items-center justify-center">
            <Users className="h-5 w-5 text-[#8b5cf6]" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <p className="text-3xl font-bold text-[#0f172a]">
            {activeClients}
          </p>
          
          {/* Client Avatars */}
          <div className="mt-4 flex flex-wrap gap-2">
            {recentClients.map((client, index) => (
              <div 
                key={index} 
                className="h-9 w-9 rounded-full bg-[#8b5cf630] flex items-center justify-center 
                         text-xs font-semibold text-[#8b5cf6] overflow-hidden"
                title={client.name}
              >
             
                 { client.name.substring(0, 2).toUpperCase()}
               
              </div>
            ))}
            
            {activeClients > recentClients.length && (
              <div className="h-9 w-9 rounded-full bg-[#f1f5f9] flex items-center justify-center 
                           text-xs font-medium text-[#64748b]">
                +{activeClients - recentClients.length}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className={`h-2 w-2 rounded-full ${changeRate >= 0 ? 'bg-[#22c55e]' : 'bg-[#f43f5e]'} mr-2`} />
              <span className="text-sm text-[#64748b]">
                {changeRate >= 0 ? '+' : ''}{changeRate}% this month
              </span>
            </div>
            <button className="text-xs text-[#6366f1] font-medium hover:underline">
              View All
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
