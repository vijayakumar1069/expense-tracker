/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, X } from "lucide-react";
import InvoiceForm from "./InvoiceForm";
import {
  createInvoice,
  deleteInvoice,
  updateInvoice,
} from "../__actions/invoiceActions";
import RenderInvoiceDetails from "./RenderInvoiceDetails";
import { InvoiceWithContents } from "./InvoiceTable";
import { InvoiceFormValues } from "@/utils/types";
import { PasswordVerification } from "@/components/ui components/PasswordVerification";

// Response type for your API
type InvoiceResponse = {
  success: boolean;
  data: InvoiceWithContents[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const InvoiceDialog = ({
  invoice,
  open,
  onOpenChange,
}: {
  invoice?: InvoiceWithContents;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [showPasswordVerification, setShowPasswordVerification] =
    useState(false);
  const isNewInvoice = !invoice?.id;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setShowPasswordVerification(false);
      setTimeout(() => setIsEditMode(isNewInvoice), 100);
    } else {
      setShowPasswordVerification(false);
      setIsEditMode(isNewInvoice);
    }
    onOpenChange(open);
  };
  // Add invoice mutation
  const addMutation = useMutation({
    mutationFn: (data: InvoiceFormValues) => {
      const formattedData = {
        ...data,
        clientPhone2: data.clientPhone2 || undefined,
        invoiceContents: data.invoiceContents.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          invoiceId: crypto.randomUUID(),
        })),
      };
      return createInvoice(formattedData);
    },
    onMutate: async (newInvoiceData) => {
      toast.loading("Adding invoice...", {
        id: "add-invoice-toast",
        duration: 2000,
      });

      await queryClient.cancelQueries({
        queryKey: ["invoices"],
        exact: false,
      });

      const queryCache = queryClient.getQueryCache();
      const invoiceQueries = queryCache.findAll({
        queryKey: ["invoices"],
      });

      const previousDataMap = new Map();
      invoiceQueries.forEach((query) => {
        previousDataMap.set(query.queryKey, query.state.data);
      });
      // Create optimistic invoice
      const optimisticInvoice = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "optimistic-user",
        ...newInvoiceData,
      };

      invoiceQueries.forEach((query) => {
        const data = query.state.data as InvoiceResponse;
        if (data && data.data) {
          queryClient.setQueryData(query.queryKey, {
            ...data,
            data: [...data.data, optimisticInvoice],
          });
        }
      });

      return { previousDataMap, optimisticInvoice };
    },
    onSuccess: () => {
      toast.success("Invoice added successfully!", {
        id: "add-invoice-toast",
        duration: 2500,
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setShowPasswordVerification(false);
      handleOpenChange(false);
    },
    onError: (error, _, context) => {
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to add invoice",
        {
          id: "add-invoice-toast",
          duration: 2500,
        }
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InvoiceFormValues & { id: string }) => {
      const formattedData = {
        ...data,
        clientPhone2: data.clientPhone2 || "",
        invoiceContents: data.invoiceContents.map((item) => ({
          ...item,
          id: item.id || crypto.randomUUID(),
          createdAt: item.createdAt || new Date(),
          updatedAt: new Date(),
          invoiceId: data.id,
        })),
      };

      return updateInvoice(formattedData);
    },
    onMutate: async (updatedInvoiceData) => {
      toast.loading("Updating invoice...", {
        id: "update-invoice-toast",
        duration: 2000,
      });

      await queryClient.cancelQueries({
        queryKey: ["invoices"],
        exact: false,
      });

      const queryCache = queryClient.getQueryCache();
      const invoiceQueries = queryCache.findAll({
        queryKey: ["invoices"],
      });

      const previousDataMap = new Map();
      invoiceQueries.forEach((query) => {
        previousDataMap.set(query.queryKey, query.state.data);
      });

      invoiceQueries.forEach((query) => {
        const data = query.state.data as InvoiceResponse;
        if (data && data.data) {
          queryClient.setQueryData(query.queryKey, {
            ...data,
            data: data.data.map((inv) =>
              inv.id === updatedInvoiceData.id
                ? { ...inv, ...updatedInvoiceData }
                : inv
            ),
          });
        }
      });

      return { previousDataMap };
    },
    onSuccess: () => {
      toast.success("Invoice updated successfully!", {
        id: "update-invoice-toast",
        duration: 2500,
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setShowPasswordVerification(false);
      setIsEditMode(false);
    },
    onError: (error, _, context) => {
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to update invoice",
        {
          id: "update-invoice-toast",
          duration: 2500,
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onMutate: async (invoiceId) => {
      toast.loading("Deleting invoice...", {
        id: "delete-invoice-toast",
        duration: 2000,
      });

      await queryClient.cancelQueries({
        queryKey: ["invoices"],
        exact: false,
      });

      const queryCache = queryClient.getQueryCache();
      const invoiceQueries = queryCache.findAll({
        queryKey: ["invoices"],
      });

      const previousDataMap = new Map();
      invoiceQueries.forEach((query) => {
        previousDataMap.set(query.queryKey, query.state.data);
      });

      invoiceQueries.forEach((query) => {
        const data = query.state.data as InvoiceResponse;
        if (data && data.data) {
          queryClient.setQueryData(query.queryKey, {
            ...data,
            data: data.data.filter((inv) => inv.id !== invoiceId),
          });
        }
      });

      return { previousDataMap };
    },
    onSuccess: () => {
      toast.success("Invoice deleted successfully!", {
        id: "delete-invoice-toast",
        duration: 2500,
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setShowPasswordVerification(false);
      setIsEditMode(false);
      onOpenChange(false);
      setDeleteDialogOpen(false);
    },
    onError: (error, _, context) => {
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to delete invoice",
        {
          id: "delete-invoice-toast",
          duration: 2500,
        }
      );
    },
  });

  const handleSubmit = (data: any) => {
    if (invoice?.id) {
      updateMutation.mutate({ ...data, id: invoice.id } as any);
      setIsEditMode(false);
      onOpenChange(false);
    } else {
      addMutation.mutate(data as any);
      onOpenChange(false);
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setInvoiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      deleteMutation.mutate(invoiceToDelete);
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`${showPasswordVerification ? "sm:max-w-[435px]" : "sm:max-w-5xl"}  bg-primary-foreground max-h-[90vh] overflow-y-auto p-2`}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-center">
            {isNewInvoice
              ? "Create Invoice"
              : isEditMode
                ? "Edit Invoice"
                : "Invoice Details"}
          </DialogTitle>
        </DialogHeader>

        {showPasswordVerification ? (
          <PasswordVerification
            onVerificationSuccess={() => {
              setIsEditMode(true);
              setShowPasswordVerification(false);
            }}
            onCancel={() => setShowPasswordVerification(false)}
          />
        ) : (
          <>
            {isEditMode || isNewInvoice ? (
              <InvoiceForm
                defaultValues={invoice}
                onSubmit={handleSubmit}
                isSubmitting={addMutation.isPending || updateMutation.isPending}
              />
            ) : (
              <RenderInvoiceDetails invoice={invoice} />
            )}
          </>
        )}

        {!showPasswordVerification && !isNewInvoice && !isEditMode && (
          <DialogFooter className="flex justify-between sm:justify-between">
            <div>
              <Button
                variant="destructive"
                onClick={(e) => {
                  handleDelete(invoice.id, e);
                  setShowPasswordVerification(true);
                }}
                disabled={deleteMutation.isPending}
                className="mr-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowPasswordVerification(true)}
                className="hover:bg-purple-400"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="mr-2 hover:bg-ring"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </DialogFooter>
        )}
        {!isNewInvoice && isEditMode && (
          <div className="flex justify-end ">
            <Button
              variant="outline"
              onClick={() => setIsEditMode(false)}
              className="mr-2"
            >
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        {/* <DialogTitle>Confirm Deletion</DialogTitle> */}
        <DialogContent className="sm:max-w-[425px] bg-white">
          {showPasswordVerification ? (
            <PasswordVerification
              onVerificationSuccess={() => {
                setIsEditMode(true);
                setShowPasswordVerification(false);
              }}
              onCancel={() => setShowPasswordVerification(false)}
            />
          ) : (
            <div className="">
              <DialogHeader>
                <DialogTitle className="text-red-600 dark:text-red-400">
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete invoice #
                  {invoice?.invoiceNumber}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex items-center justify-between sm:justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Invoice
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
export default InvoiceDialog;
