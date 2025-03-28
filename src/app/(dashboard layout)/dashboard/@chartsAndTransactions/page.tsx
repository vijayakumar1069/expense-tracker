import { CategoryDistributionChart } from "./__components/CategoryDistributionChart";
import { RecentTransactions } from "./__components/RecentTransactions";

export default function ChartsAndTransactionPage() {
    return (
        <div className="grid gap-4 md:grid-cols-2">
           <CategoryDistributionChart/>
           <RecentTransactions/>
        </div>
    );
}