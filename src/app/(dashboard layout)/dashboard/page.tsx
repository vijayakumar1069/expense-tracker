import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
// import ClientsCard from "./@cards/__components/ClientsCard";
import ExpenseCard from "./@cards/__components/ExpenseCard";
import { ExpensePaymentMethods } from "./@cards/__components/ExpensePaymentMethods";
import TransactionsCard from "./@cards/__components/TransactionsCard";
import InvoiceCard from "./@cards/__components/InvoiceCard";
import { IncomeExpenseChartComponent } from "./@incomeExpenseCharts/__components/IncomeExpenseChartComponent";
import { CategoryDistributionChart } from "./@chartsAndTransactions/__components/CategoryDistributionChart";
import { RecentTransactions } from "./@chartsAndTransactions/__components/RecentTransactions";

export const dynamic = "force-dynamic";

export default async function Admin_Dashboard() {
  return (
    <div className="p-6 bg-background/10 rounded-lg">
      <Tabs defaultValue="cards" className="w-full rounded-xl">
        <TabsList className="flex w-full overflow-x-auto px-1 py-2 bg-white border-b gap-1 h-auto md:h-12 rounded-xl">
          <TabsTrigger
            value="cards"
            className="rounded-lg px-4 py-2 text-sm font-medium text-black data-[state=active]:text-primary data-[state=active]:bg-blue-100 data-[state=active]:border-b-2 data-[state=active]:border-primary whitespace-nowrap"
          >
            Financial Overview
          </TabsTrigger>
          <TabsTrigger
            value="expensePaymentMethods"
            className="rounded-lg px-4 py-2 text-sm font-medium text-black data-[state=active]:text-primary data-[state=active]:bg-blue-100 data-[state=active]:border-b-2 data-[state=active]:border-primary whitespace-nowrap"
          >
            Payment Methods
          </TabsTrigger>
          <TabsTrigger
            value="RecentTransActionAndPendingInvoices"
            className="rounded-lg px-4 py-2 text-sm font-medium text-black data-[state=active]:text-primary data-[state=active]:bg-blue-100 data-[state=active]:border-b-2 data-[state=active]:border-primary whitespace-nowrap truncate"
          >
            Transactions & Invoices
          </TabsTrigger>
          <TabsTrigger
            value="IncomeVsExpense"
            className="rounded-lg px-4 py-2 text-sm font-medium text-black data-[state=active]:text-primary data-[state=active]:bg-blue-100 data-[state=active]:border-b-2 data-[state=active]:border-primary whitespace-nowrap"
          >
            Income vs Expense
          </TabsTrigger>
          <TabsTrigger
            value="categoryDistributionAndRecentTransactions"
            className="rounded-lg px-4 py-2 text-sm font-medium text-black data-[state=active]:text-primary data-[state=active]:bg-blue-100 data-[state=active]:border-b-2 data-[state=active]:border-primary whitespace-nowrap truncate"
          >
            Category Distribution
          </TabsTrigger>
        </TabsList>

        <div className="mt-2">
          <TabsContent value="cards">
            <Card className="border-0 shadow-none p-2">
              <CardContent className="p-0 space-y-6">
                <ExpenseCard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expensePaymentMethods">
            <Card className="border-0 shadow-none p-2">
              <CardContent className="p-0 space-y-6">
                <ExpensePaymentMethods />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="RecentTransActionAndPendingInvoices">
            <Card className="border-0 shadow-none p-2">
              <CardContent className="p-0 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <TransactionsCard />
                  <InvoiceCard />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="IncomeVsExpense">
            <Card className="border-0 shadow-none p-2">
              <CardContent className="p-0 space-y-6">
                <IncomeExpenseChartComponent />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="categoryDistributionAndRecentTransactions">
            <Card className="border-0 shadow-none p-2">
              <CardContent className="p-0 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <CategoryDistributionChart />
                  <RecentTransactions />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
