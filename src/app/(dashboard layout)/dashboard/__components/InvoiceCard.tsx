// app/dashboard/@invoice/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning } from "lucide-react";
import { fetchInvoiceData } from "../__actions/cardsActions";
import Link from "next/link";

export default async function InvoiceCard() {
  const { pendingInvoices, invoicesByStatus } = await fetchInvoiceData();

  return (
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-[#fef9c3] to-white">
      <CardHeader className="pb-2 pt-6">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span className="text-[#0f172a]">Pending Invoices</span>
          <div className="h-10 w-10 rounded-full bg-[#eab30820] flex items-center justify-center">
            <FileWarning className="h-5 w-5 text-[#eab308]" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <div className="relative h-24 w-24 mr-6">
            <svg
              className="h-24 w-24 transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#fef9c320"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#eab308"
                strokeWidth="10"
                strokeDasharray={`${pendingInvoices.percentage * 2.51} 251.2`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-[#0f172a]">
                {pendingInvoices.count}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="space-y-2">
              {invoicesByStatus.map((status, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm text-[#64748b]">
                      {status.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[#0f172a]">
                    {status.count}
                  </span>
                </div>
              ))}
            </div>

            <Link href={"/New-Invoices"}>
              <button className="mt-4 px-3 py-1 text-xs text-[#6366f1] font-medium rounded-md border border-[#6366f140] hover:bg-[#eef2ff] transition-colors">
                View All Invoices
              </button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
