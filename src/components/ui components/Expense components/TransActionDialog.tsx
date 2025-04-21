"use client";
import React, { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { expenseFormSchema } from "@/utils/schema/expenseSchema";

import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionResponse } from "@/utils/types";
import { TransactionForm } from "./transaction dialog/TransactionForm";
import { createExpense } from "@/app/(dashboard layout)/New-Transactions/__actions/transactionActions";

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
  const [viewMode, setViewMode] = useState(false); // Add this state
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

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
      transferMode: transaction?.transferMode || undefined,
      chequeNo: transaction?.chequeNo || "",
      chequeDate: transaction?.chequeDate || "",
      transactionNumber: transaction?.transactionNumber || "",
      invoiceNo: transaction?.invoiceNo || "",
      date: transaction?.date || new Date().toISOString().split("T")[0],
      images: [],
      existingImages: [], // Keep this for schema compatibility
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: TransactionFormValues) => {
      const formData = new FormData();

      // Add regular form fields
      Object.entries(data).forEach(([key, value]) => {
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
      if (data.images && Array.isArray(data.images)) {
        // Using append multiple times with same key creates an array on server
        data.images.forEach((file: File) => {
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

      return createExpense(formData);
    },
    onMutate: async () => {
      toast.loading("Adding transaction...", {
        duration: 2000,
        position: "top-center",
        id: "add-transaction-toast",
      });

      // Cancel any outgoing refetches for all transaction queries
      await queryClient.cancelQueries({
        queryKey: ["transactions"],
        exact: false, // This will match all queries that start with "transactions"
      });

      // Get all existing transaction query data
      const queryCache = queryClient.getQueryCache();
      const transactionQueries = queryCache.findAll({
        queryKey: ["transactions"],
      });

      const previousDataMap = new Map();

      // Store all previous data
      transactionQueries.forEach((query) => {
        const data = query.state.data as TransactionResponse;
        previousDataMap.set(query.queryKey, data?.transactions);
      });

      return { previousDataMap };
    },
    onSuccess: () => {
      toast.success("Transaction added successfully", {
        id: "add-transaction-toast",
        duration: 2500,
        position: "top-center",
      });

      setViewMode(true);
      setOpen(false);
      form.reset();

      // Invalidate all transaction queries
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        exact: false,
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
          id: "add-transaction-toast",
          duration: 2500,
          position: "top-center",
        }
      );
    },
    onSettled: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        exact: false,
      });
    },
  });

  const onFormSubmit = async (data: TransactionFormValues) => {
    startTransition(() => {
      mutation.mutate(data);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setViewMode(false); // Reset viewMode when closing
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-gradient-to-r from-primary to-[#8b5cf6] w-fit"
        >
          {mode === "add" ? "Add Transaction" : "Edit Transaction"}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-full sm:max-w-[700px] bg-primary-foreground p-5 max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-[#8b5cf6] bg-clip-text text-transparent">
            {mode === "add" ? "Add Transaction" : "Edit Transaction"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <TransactionForm
            form={form}
            onSubmit={onFormSubmit}
            isPending={isPending}
            mode={mode}
            viewMode={viewMode}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default TransActionDialog;
