"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Invoice, InvoiceContents } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Printer, Trash2, X } from "lucide-react";
import InvoiceForm from "./InvoiceForm";
import {
  createInvoice,
  deleteInvoice,
  updateInvoice,
} from "../__actions/invoiceActions";
// import { formatCurrency, formatDate } from "@/lib/utils";

// Define the type for invoice with its contents
type InvoiceWithContents = Invoice & {
  invoiceContents: InvoiceContents[];
};

// Type for the form values (similar to your InvoiceFormValues)
type InvoiceFormValues = Omit<
  InvoiceWithContents,
  "id" | "createdAt" | "updatedAt" | "userId"
>;

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
  console.log(invoice);
  const isNewInvoice = !invoice?.id;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => setIsEditMode(isNewInvoice), 100);
    } else {
      setIsEditMode(isNewInvoice);
    }
    onOpenChange(open);
  };
  // Add invoice mutation
  const addMutation = useMutation({
    mutationFn: (data: InvoiceFormValues) => {
      const formattedData = {
        ...data,
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
      handleOpenChange(false);
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

  const handleSubmit = (data: InvoiceFormValues) => {
    console.log(invoice);
    if (invoice?.id) {
      console.log("editing");
      updateMutation.mutate({ ...data, id: invoice.id });
      setIsEditMode(false);
      onOpenChange(false);
    } else {
      console.log("adding");
      addMutation.mutate(data);
      setIsEditMode(false);
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

  const renderInvoiceDetails = () => {
    if (!invoice) return null;

    const statusColors = {
      DRAFT: "bg-gray-200 text-gray-800",
      SENT: "bg-blue-100 text-blue-800",
      PAID: "bg-green-100 text-green-800",
      OVERDUE: "bg-red-100 text-red-800",
      CANCELLED: "bg-yellow-100 text-yellow-800",
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              Invoice Number
            </h3>
            <p className="text-base font-medium">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                statusColors[invoice.status]
              }`}
            >
              {invoice.status}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
          <p className="text-base font-medium">{invoice.clientName}</p>
          <p className="text-sm">{invoice.clientEmail}</p>
          <p className="text-sm">{invoice.clientPhone}</p>
          <p className="text-sm whitespace-pre-wrap">{invoice.clientAddress}</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Items</h3>
          <div className="border rounded-md divide-y">
            {invoice.invoiceContents.map((item, index) => (
              <div key={index} className="p-3 flex justify-between">
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × {item.price}
                  </p>
                </div>
                <p className="font-medium">{item.total}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-3 border-t">
          <div className="flex justify-between">
            <p className="text-muted-foreground">Subtotal</p>
            <p>{invoice.subtotal}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-foreground">Tax ({invoice.taxRate}%)</p>
            <p>{invoice.taxAmount}</p>
          </div>
          <div className="flex justify-between font-medium text-lg">
            <p>Total</p>
            <p>{invoice.invoiceTotal}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-6xl bg-primary-foreground ">
        <DialogHeader>
          <DialogTitle>
            {isNewInvoice
              ? "Create New Invoice"
              : isEditMode
              ? "Edit Invoice"
              : "Invoice Details"}
          </DialogTitle>
          <DialogDescription>
            {isNewInvoice
              ? "Fill out the form below to create a new invoice."
              : isEditMode
              ? "Update the invoice information below."
              : `Invoice #${invoice?.invoiceNumber}`}
          </DialogDescription>
        </DialogHeader>

        {isEditMode || isNewInvoice ? (
          <InvoiceForm
            defaultValues={invoice}
            onSubmit={handleSubmit}
            isSubmitting={addMutation.isPending || updateMutation.isPending}
          />
        ) : (
          renderInvoiceDetails()
        )}

        {!isNewInvoice && !isEditMode && (
          <DialogFooter className="flex justify-between sm:justify-between">
            <div>
              <Button
                variant="destructive"
                onClick={(e) => {
                  handleDelete(invoice.id, e);
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
                onClick={() => {
                  /* Add print function */
                }}
                variant="outline"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                onClick={() => setIsEditMode(true)}
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
          <div className="flex justify-end mt-4">
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
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice #{invoice?.invoiceNumber}?
              This action cannot be undone.
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
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
export default InvoiceDialog;
