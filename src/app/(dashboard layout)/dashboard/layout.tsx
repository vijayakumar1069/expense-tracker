import React, { ReactNode } from "react";
import "../../../app/globals.css"
export default function LayoutForDashboard({
    children,
    cards,
    incomeExpenseCharts,
    chartsAndTransactions
}:{
    children: ReactNode;
    cards: ReactNode;
    incomeExpenseCharts: ReactNode;
    chartsAndTransactions: ReactNode;

}) {
    return (
        <div className="p-3 mx-auto">
            {
                children
            }
            {
                cards
            }
            {
                incomeExpenseCharts
            }
            {
                chartsAndTransactions
            }
        </div>
    );
}