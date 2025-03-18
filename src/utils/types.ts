import { Transaction } from "@prisma/client";
import { LucideIcon } from "lucide-react";

// types/index.ts
export interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
}

export type AuthUser = {
    id: string;
    email: string;
    sessionToken: string;
};

export enum PaymentMethodType {
    CASH = "CASH",
    BANK = "BANK",
    CHEQUE = "CHEQUE",
    INVOICE = "INVOICE",
}

export interface TransactionResponse {
    transactions: Transaction[];
    pagination: {
        totalPages: number;
        totalItems: number;
        currentPage: number;
        itemsPerPage: number;
    };
    summary: {
        totalIncome: number;
        totalExpense: number;
        netAmount: number;
    };
}