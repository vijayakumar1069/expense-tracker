import { LucideIcon } from "lucide-react";
import { z } from "zod";
import { expenseFormSchema } from "./schema/expenseSchema";
import { Invoice, Transaction as PrismaTransaction } from "@prisma/client";
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
    phone1: string;
    phone2: string;
    streetName: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    companyName: string;

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
export interface InvoiceResponse {
    data: Invoice[];
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
    viewMode?: boolean;
    setViewMode?: (viewMode: boolean) => void;
}

export type UpdateTransactionResult = {
    success: boolean;
    data?: unknown;
    error?: string;

};



export const clientSchema = z.object({
    clientId: z.string().optional(),
    name: z.string().optional(),
    companyName: z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    phone1: z.string().min(10, "Phone must be at least 10 characters"),
    phone2: z.string().optional(),
    streetName: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(3, "City must be at least 3 characters"),
    state: z.string().min(3, "State must be at least 3 characters"),
    zip: z.string().min(5, "Zip code must be at least 5 characters"),
    country: z.string().min(3, "Country must be at least 3 characters"),
}).refine(data => {
    // Ensure either name or companyName (or both) are present
    return Boolean(data.name) || Boolean(data.companyName);
}, {
    message: "Either name or company name must be provided",
    path: ["name"] // This will highlight the name field for the error
});

export type ClientFormValues = z.infer<typeof clientSchema>;


// types/form.ts
export interface UserFormValues {
    email: string;
    name?: string;
    password: string;
    rememberMe?: boolean;
    // Add other fields as needed
}


export interface ErrorResponse {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
    code?: string;
}