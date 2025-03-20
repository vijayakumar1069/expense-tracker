"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { expenseFormSchema } from "@/utils/schema/expenseSchema";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useTransition } from "react";
import { z } from "zod";
import { TransactionForm } from "./TransactionForm";
import { updateTransaction } from "@/app/(dashboard layout)/New-Transactions/__actions/transactionActions";

type TransactionFormValues = z.infer<typeof expenseFormSchema>;

export const TransActionEditButton: React.FC<{ transactionId: string }> = ({
  transactionId,
}) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formValues, setFormValues] = useState<
    TransactionFormValues | undefined
  >(undefined);

  const queryClient = useQueryClient();

  // Fetch transaction details when dialog opens
  const { data: transaction, isLoading } = useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: async () => {
      if (open) {
        const response = await fetch(
          `/api/get-single-transaction/${transactionId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch transaction");
        }
        return response.json();
      }
      return null;
    },
    enabled: open,
  });

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      transactionType: "EXPENSE",
      name: "",
      description: "",
      category: "",
      amount: "",
      taxType: "",
      total: "",

      paymentMethodType: "CASH",
      receivedBy: "",
      bankName: "",
      chequeNo: "",
      chequeDate: "",
      invoiceNo: "",
      date: new Date().toISOString().split("T")[0],
      images: [],
      existingImages: [],
    },
  });

  // Update form values when transaction data is loaded
  useEffect(() => {
    if (transaction) {
      const values = {
        transactionType: transaction.type || "EXPENSE",
        name: transaction.name || "",
        description: transaction.description || "",
        category: transaction.category || "",
        amount: transaction.amount?.toString() || "",
        taxType: transaction.tax || "",
        total: transaction.total?.toString() || "",

        paymentMethodType: transaction.paymentMethod.type || "CASH",
        receivedBy: transaction.paymentMethod.receivedBy || "",
        bankName: transaction.paymentMethod.bankName || "",
        chequeNo: transaction.paymentMethod.chequeNo || "",
        chequeDate:
          new Date(transaction.paymentMethod.chequeDate)
            .toISOString()
            .split("T")[0] || "",
        invoiceNo: transaction.paymentMethod.invoiceNo || "",
        date:
          new Date(transaction.date).toISOString().split("T")[0] ||
          new Date().toISOString().split("T")[0],
        images: transaction.attachments || [],
        existingImages: transaction.attachments || [],
        attachments: transaction.attachments || [],
      };
      setFormValues(values);
      form.reset(values);
    }
  }, [transaction]);

  const mutation = useMutation({
    mutationFn: async (data: TransactionFormValues) => {
      const formFieldData = form.getValues();
      const formData = new FormData();

      // Add regular form fields
      Object.entries(formFieldData).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          key !== "images" &&
          key !== "existingImages"
        ) {
          formData.append(key, String(value));
        }
      });
      // Handle images separately and correctly
      if (formFieldData.images && Array.isArray(formFieldData.images)) {
        // Using append multiple times with same key creates an array on server
        formFieldData.images.forEach((file: File) => {
          if (file instanceof File) {
            formData.append("images", file);
          }
        });
      } else {
        // IMPORTANT: If no images, send an empty array as JSON
        formData.append("images", JSON.stringify([]));
      }

      // Handle existing images
      if (data.existingImages && Array.isArray(data.existingImages)) {
        formData.append("existingImages", JSON.stringify(data.existingImages));
      }

      return updateTransaction(transactionId, formData);
    },
    onMutate: async () => {
      toast.loading("Updating transaction...", {
        duration: 2000,
        position: "top-center",
        id: "update-transaction-toast",
      });

      // Cancel any outgoing refetches to avoid them overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: ["transactions"],
        exact: false,
      });

      // Store the previous data for potential rollback
      const queryCache = queryClient.getQueryCache();
      const transactionQueries = queryCache.findAll({
        queryKey: ["transactions"],
      });

      const previousDataMap = new Map();
      transactionQueries.forEach((query) => {
        previousDataMap.set(query.queryKey, query.state.data);
      });

      return { previousDataMap };
    },
    onSuccess: () => {
      toast.success("Transaction updated successfully", {
        id: "update-transaction-toast",
        duration: 2500,
        position: "top-center",
      });

      setOpen(false);
      form.reset();

      // Invalidate all transaction queries to refetch latest data
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        exact: false,
      });

      // Also invalidate the single transaction query
      queryClient.invalidateQueries({
        queryKey: ["transaction", transactionId],
      });
    },
    onError: (error, variables, context) => {
      // Revert all optimistic updates
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred",
        {
          id: "update-transaction-toast",
          duration: 2500,
          position: "top-center",
        }
      );
    },
  });

  const onFormSubmit = async (data: TransactionFormValues) => {
    startTransition(() => {
      mutation.mutate(data);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="mr-2">
          <Pencil className="h-4 w-4 mr-1 text-white" />
          <span className="text-white">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-full sm:max-w-[700px] bg-primary-foreground p-5"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-[#8b5cf6] bg-clip-text text-transparent">
            Edit Transaction
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <TransactionForm
            form={form}
            onSubmit={onFormSubmit}
            isPending={isPending}
            mode="edit"
            initialValues={formValues}
            id={transactionId}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
