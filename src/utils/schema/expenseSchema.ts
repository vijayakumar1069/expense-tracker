import { z } from "zod";

// Zod Schema
export const expenseFormSchema = z.object({
    transactionType: z.enum(["EXPENSE", "INCOME"]),
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    category: z.string({
        required_error: "Please select a category",
    }),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
    taxType: z.string({
        required_error: "Please select a tax type",
    }),
    total: z.string(),
    paymentMethodType: z.enum(["CASH", "BANK", "CHEQUE", "INVOICE"]),
    receivedBy: z.string().optional(),
    bankName: z.string().optional(),
    chequeNo: z.string().optional(),
    chequeDate: z.string().optional(),
    invoiceNo: z.string().optional(),
    date: z.string({
        required_error: "Please select a date",
    }),
    image: z.any().optional(),
});