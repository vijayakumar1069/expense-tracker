import React, { ReactNode } from "react";
import "../../../app/globals.css"
export default function LayoutForDashboard({
    children,
    cards
}:{
    children: ReactNode;
    cards: ReactNode;

}) {
    return (
        <div>
            {
                cards
            }
            {
                children
            }
        </div>
    );
}