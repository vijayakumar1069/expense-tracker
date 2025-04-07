// import ExpenseCard from "./__components/ExpenseCard";
// import { ExpensePaymentMethods } from "./__components/ExpensePaymentMethods";
// import IncomeCard from "./__components/IncomeCard";
// import InvoiceCard from "./__components/InvoiceCard";
// import ProfitCard from "./__components/ProfitCard";
// import TransactionsCard from "./__components/TransactionsCard";

export default function CardsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1  gap-5">
        {/* <IncomeCard/> */}
        {/* <ExpenseCard /> */}
        {/* <ProfitCard/> */}
      </div>
      {/* <div className="">
        <ExpensePaymentMethods />
      </div> */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TransactionsCard />
        <InvoiceCard />
      </div> */}
    </div>
  );
}
