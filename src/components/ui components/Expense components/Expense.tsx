import React from "react";
import TransActionDialog from "./TransActionDialog";
import ExpenseTable from "./ExpenseTable";
// import { useQuery } from "@tanstack/react-query";

const Expense = () => {


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-[#8b5cf6] bg-clip-text text-transparent">
          Expenses
        </h1>
        <TransActionDialog mode="add" />
      </div>
      <ExpenseTable />

    </div>
  );
};

export default Expense;
