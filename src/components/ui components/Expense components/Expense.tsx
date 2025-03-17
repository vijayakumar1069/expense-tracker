import React from "react";
import ExpenseDialog from "./ExpenseDialog";

const Expense = () => {
  //   const handleSubmit = (data: any) => {
  //     console.log("Form submitted:", data);
  //     // Handle your form submission logic here
  //   };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-[#8b5cf6] bg-clip-text text-transparent">
          Expenses
        </h1>
        <ExpenseDialog mode="add" />
      </div>

      {/* Your expenses list/table goes here */}
    </div>
  );
};

export default Expense;
