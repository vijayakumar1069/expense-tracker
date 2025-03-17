// utils/constants/consts.ts
import { LayoutDashboard, Receipt, Wallet, FileText } from "lucide-react";
import { NavItem } from "../types";


export const adminNavbarValues: NavItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard
    },
    {
        title: "Expenses",
        href: "/New-Expenses",
        icon: Receipt
    },
    {
        title: "Income",
        href: "/New-Incomes",
        icon: Wallet
    },
    {
        title: "Invoices",
        href: "/New-Invoices",
        icon: FileText
    }
];
