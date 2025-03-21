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
export interface PaymentType {
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

export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ClientResponse {
    data: Client[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
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

export type UpdateTransactionResult = {
    success: boolean;
    data?: unknown;
    error?: string;

};



export const clientSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Phone must be at least 10 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
});

export type ClientFormValues = z.infer<typeof clientSchema>;