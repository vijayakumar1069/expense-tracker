"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  FileDigit,
  // Pencil,
  Plus,
  // Trash2,
} from "lucide-react";
// import ClientDialog from "./ClientDialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
// import ClientFilters from "./ClientFilters";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Invoice } from "@prisma/client";
// import { deleteClient } from "../__actions/clientsActions";
// import { toast } from "sonner";
import { InvoiceResponse } from "@/utils/types";
import InvoiceDialog from "./InvoiceDialog";
import InvoiceFilter from "./InvoiceFilter";

// Define proper types for client data and API responses

const InvoiceTable = () => {
  const [filters, setFilters] = useState<{
    clientName?: string;
    invoiceNumber?: string;
  }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 2;
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(
    undefined
  );

  // const queryClient = useQueryClient();

  // Query for fetching clients with TanStack Query
  const { data, isLoading, isError } = useQuery<InvoiceResponse>({
    queryKey: ["invoices", filters, currentPage, limit],
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      // Add filter parameters if they exist
      if (filters.clientName) params.append("clientName", filters.clientName);
      if (filters.invoiceNumber)
        params.append("invoiceNumber", filters.invoiceNumber);

      const response = await fetch(
        `/api/get-all-invoices?${params.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch clients");
      }

      return response.json();
    },
  });

  const handleAddNew = () => {
    setSelectedInvoice(undefined);
    setDialogOpen(true);
  };

  // Page change handlers
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (data?.pagination && currentPage < data.pagination.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load clients. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const invoices = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div>
      <InvoiceFilter onFilterChange={setFilters} />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Invoice List</h2>
        <Button onClick={handleAddNew} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add New Invoice
        </Button>
      </div>

      <InvoiceDialog
        invoice={selectedInvoice}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                {/* <TableHead className="text-right">Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {Array.from({ length: 5 }).map((_, cellIndex) => (
                      <TableCell key={`cell-${index}-${cellIndex}`}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    onClick={() => handleViewInvoice(invoice)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>{invoice.clientEmail}</TableCell>
                    <TableCell>{invoice.clientPhone}</TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      // title={invoice.clientAddress}
                    >
                      {invoice.clientCountry}
                    </TableCell>
                    {/* <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(client)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-950"
                        onClick={() => handleDelete(client.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell> */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No clients found.{" "}
                    {filters.clientName || filters.invoiceNumber
                      ? "Try clearing your filters."
                      : "Add a new client to get started."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 mt-6">
        <div className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md text-gray-700 dark:text-gray-300 flex items-center gap-1">
          <FileDigit className="h-3.5 w-3.5 text-indigo-500" />
          Page {currentPage} of {totalPages}
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || isLoading}
            className="group border-gray-300 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
          >
            <ChevronLeft className="h-4 w-4 mr-1 text-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Previous
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoading}
            className="group border-gray-300 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
          >
            <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Next
            </span>
            <ChevronRight className="h-4 w-4 ml-1 text-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTable;
