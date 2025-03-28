import ExpenseCard from "./__components/ExpenseCard";
import IncomeCard from "./__components/IncomeCard";
import InvoiceCard from "./__components/InvoiceCard";
import ProfitCard from "./__components/ProfitCard";
import TransactionsCard from "./__components/TransactionsCard";

export default function CardsPage() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5">
           <IncomeCard/>
           <ExpenseCard/>
           <ProfitCard/>
           <TransactionsCard/>  
           <InvoiceCard/>

        </div>
    );
}