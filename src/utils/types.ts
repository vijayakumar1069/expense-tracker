import { Transaction } from "@prisma/client";
import { LucideIcon } from "lucide-react";
import { z } from "zod";
import { expenseFormSchema } from "./schema/expenseSchema";
import { Transaction as PrismaTransaction } from "@prisma/client";
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

export interface categoryType {
    id: string, name: string, icon: LucideIcon, color: string

}
export interface PaymenTsype {
    id: string, name: string
}
export enum PaymentMethodType {
    CASH = "CASH",
    BANK = "BANK",
    CHEQUE = "CHEQUE",
    INVOICE = "INVOICE",
}

export interface TransactionResponse {
    transactions: TransactionWithPaymentMethod[];
    pagination: {
        totalPages: number;
        totalItems: number;
        currentPage: number;
        itemsPerPage: number;
    };
    summary: {
        totalIncome: number;
        totalExpenses: number;
        netAmount: number;
    };
}


type PaymentMethod = {
    id: string;
    type: string;
    receivedBy: string;
    bankName: string;
    chequeNo: string;
    chequeDate: Date | null;
    invoiceNo: string;
    transactionId: string;
    createdAt: Date;
    updatedAt: Date;
};
export interface TransactionWithPaymentMethod extends PrismaTransaction {
    paymentMethod: PaymentMethod;
}
export type TransactionFormValues = z.infer<typeof expenseFormSchema>;

export interface ExpenseDialogProps {
    mode: "add" | "edit";
    transaction?: TransactionFormValues;
}

export interface FormSectionProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any; // Replace with proper form type
    isPending: boolean;
    mode?: "add" | "edit";
}