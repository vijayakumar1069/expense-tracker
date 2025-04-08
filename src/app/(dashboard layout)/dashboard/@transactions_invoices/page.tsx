import { Card, CardContent } from "@/components/ui/card";
import TransactionsCard from "../__components/TransactionsCard";
import InvoiceCard from "../__components/InvoiceCard";

export default function TransactionsInvoicesPage() {
  return (
    <Card className="border-0 shadow-none p-2">
      <CardContent className="p-0 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TransactionsCard />
          <InvoiceCard />
        </div>
      </CardContent>
    </Card>
  );
}
