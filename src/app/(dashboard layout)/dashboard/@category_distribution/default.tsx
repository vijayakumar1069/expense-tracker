import { Card, CardContent } from "@/components/ui/card";
import { CategoryDistributionChart } from "../__components/CategoryDistributionChart";
import { RecentTransactions } from "../__components/RecentTransactions";

export default function CategoryDistributionPage() {
  return (
    <Card className="border-0 shadow-none p-2">
      <CardContent className="p-0 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <CategoryDistributionChart />
          <RecentTransactions />
        </div>
      </CardContent>
    </Card>
  );
}
