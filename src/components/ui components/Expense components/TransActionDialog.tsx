"use client";
import React, { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// import { Calendar } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { expenseFormSchema } from "@/utils/schema/expenseSchema";
import {
  CATEGORIES,
  PAYMENT_METHODS,
  TAX_TYPES,
  TRANSACTION_TYPES,
} from "@/utils/constants/consts";
import { createExpense } from "@/app/(dashboard layout)/New-Expenses/__actions/newExpenseFun";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type TransactionFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseDialogProps {
  mode: "add" | "edit";
  transaction?: TransactionFormValues;
  //   onExpenseFormSubmit: (data: ExpenseFormValues) => void;
}

const TransActionDialog: React.FC<ExpenseDialogProps> = ({
  mode,
  transaction,
  //   onExpenseFormSubmit,
}) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      transactionType: transaction?.transactionType || "EXPENSE",
      name: transaction?.name || "",
      description: transaction?.description || "",
      category: transaction?.category || "",
      amount: transaction?.amount || "",
      taxType: transaction?.taxType || "",
      total: transaction?.total || "",
      paymentMethodType: transaction?.paymentMethodType || undefined,
      receivedBy: transaction?.receivedBy || "",
      bankName: transaction?.bankName || "",
      chequeNo: transaction?.chequeNo || "",
      chequeDate: transaction?.chequeDate || "",
      invoiceNo: transaction?.invoiceNo || "",
      date: transaction?.date || new Date().toISOString().split("T")[0],
    },
  });

  const calculateTotal = (amount: string, taxType: string) => {
    const numAmount = parseFloat(amount) || 0;
    const tax = TAX_TYPES.find((t) => t.id === taxType)?.rate || 0;
    return (numAmount + numAmount * tax).toFixed(2);
  };

  const handleAmountOrTaxChange = (field: string, value: string) => {
    form.setValue(field, value);
    console.log(field, value);
    const currentAmount = field === "amount" ? value : form.getValues("amount");
    const currentTaxType =
      field === "taxType" ? value : form.getValues("taxType");
    const newTotal = calculateTotal(currentAmount, currentTaxType);
    form.setValue("total", newTotal);
  };

  const onFormSubmit = async (data: TransactionFormValues) => {
    try {
      // Convert form data to FormData object
      const formData = new FormData();

      // Append all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "image" && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      startTransition(async () => {
        // onExpenseFormSubmit(formData);
        const res = await createExpense(formData);
        if (!res.success) {
          toast.error(res.error, {
            duration: 5000,
            position: "top-center",
          });
        } else {
          toast.success("Transaction added successfully", {
            duration: 5000,
            position: "top-center",
          });
          setOpen(false);
          form.reset();
        }
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
      });
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-gradient-to-r from-primary to-[#8b5cf6] text-white hover:opacity-90"
        >
          {mode === "add" ? "Add Transaction" : "Edit Transaction"}
        </Button>
      </DialogTrigger>
      <DialogContent className=" w-full sm:max-w-[700px] bg-primary-foreground p-5">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-[#8b5cf6] bg-clip-text text-transparent">
            {mode === "add" ? "Add Transaction" : "Edit Transaction"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5">
              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-primary/20 w-full">
                          <SelectValue placeholder="Select Transaction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRANSACTION_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          handleAmountOrTaxChange("amount", e.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tax Type */}
              <FormField
                control={form.control}
                name="taxType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Type</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        handleAmountOrTaxChange("taxType", value)
                      }
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Select tax type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TAX_TYPES.map((tax) => (
                          <SelectItem key={tax.id} value={tax.id}>
                            {tax.id} ({(tax.rate * 100).toFixed(0)}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Total */}
              <FormField
                control={form.control}
                name="total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-muted" />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Payment Method */}
              <FormField
                control={form.control}
                name="paymentMethodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional Fields */}
              {form.watch("paymentMethodType") === "CASH" && (
                <FormField
                  control={form.control}
                  name="receivedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Received By</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch("paymentMethodType") === "BANK" && (
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {form.watch("paymentMethodType") === "CHEQUE" && (
                <>
                  <FormField
                    control={form.control}
                    name="chequeNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cheque Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="chequeDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cheque Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              {form.watch("paymentMethodType") === "INVOICE" && (
                <FormField
                  control={form.control}
                  name="invoiceNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <FormField
                control={form.control}
                name="image"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Upload Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onChange(e.target.files?.[0])}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                type="submit"
                className="bg-gradient-to-r from-primary to-[#8b5cf6] text-white hover:opacity-90"
              >
                {mode === "add" ? (
                  isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Add Expense"
                  )
                ) : isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
export default TransActionDialog;
