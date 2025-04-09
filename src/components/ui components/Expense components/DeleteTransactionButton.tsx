"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TransactionResponse } from "@/utils/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteExpense } from "@/app/(dashboard layout)/New-Transactions/__actions/transactionActions";
import { Trash2 } from "lucide-react";

interface DeleteTransactionButtonProps {
  transactionId: string;
}

const DeleteTransactionButton: React.FC<DeleteTransactionButtonProps> = ({
  transactionId,
}) => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteExpense(transactionId),
    onMutate: async () => {
      // Show loading toast
      toast.loading("Deleting transaction...", {
        id: "delete-transaction-toast",
        duration: 2000,
      });

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["transactions"],
        exact: false,
      });

      // Get all existing transaction queries
      const queryCache = queryClient.getQueryCache();
      const transactionQueries = queryCache.findAll({
        queryKey: ["transactions"],
      });

      // Store previous data for rollback
      const previousDataMap = new Map();

      // Update all transaction queries optimistically
      transactionQueries.forEach((query) => {
        const data = query.state.data as TransactionResponse;
        if (!data) return;

        // Store previous state
        previousDataMap.set(query.queryKey, data);

        // Update query data
        queryClient.setQueryData<TransactionResponse>(query.queryKey, {
          ...data,
          transactions: data.transactions.filter((t) => t.id !== transactionId),
          summary: {
            ...data.summary,
            totalIncome: data.transactions
              .filter((t) => t.id === transactionId && t.type === "INCOME")
              .reduce(
                (acc, curr) => acc - Number(curr.amount),
                data.summary.totalIncome
              ),
            totalExpenses: data.transactions
              .filter((t) => t.id === transactionId && t.type === "EXPENSE")
              .reduce(
                (acc, curr) => acc - Number(curr.amount),
                data.summary.totalExpenses
              ),
            netAmount: data.transactions
              .filter((t) => t.id === transactionId)
              .reduce(
                (acc, curr) =>
                  curr.type === "INCOME"
                    ? acc - Number(curr.amount)
                    : acc + Number(curr.amount),
                data.summary.netAmount
              ),
          },
        });
      });

      return { previousDataMap };
    },
    onSuccess: () => {
      // Show success toast
      toast.success("Transaction deleted successfully", {
        id: "delete-transaction-toast",
        duration: 2500,
      });

      // Invalidate queries to refetch latest data
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        exact: false,
      });

      // Close the dialog
      setDialogOpen(false);
    },
    onError: (error, _, context) => {
      // Revert optimistic updates on error
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Show error toast
      toast.error(
        error instanceof Error ? error.message : "Failed to delete transaction",
        {
          id: "delete-transaction-toast",
          duration: 2500,
        }
      );

      // Close the dialog
      setDialogOpen(false);
    },
    onSettled: () => {
      // Ensure queries are refreshed
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        exact: false,
      });
    },
  });

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };

  const handleCancelDelete = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleOpenDialog}
        disabled={deleteMutation.isPending}
      >
        <Trash2 />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="sm:max-w-[425px] bg-primary border-none "
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-white">
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteTransactionButton;
