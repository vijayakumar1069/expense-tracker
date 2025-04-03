"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileDigit, Plus } from "lucide-react";

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

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Invoice, InvoiceContents } from "@prisma/client";

import { InvoiceResponse } from "@/utils/types";
import InvoiceDialog from "./InvoiceDialog";
import InvoiceFilter from "./InvoiceFilter";
import { generateInvoicePDF } from "@/lib/pdf-generator.server";
import { format } from "date-fns";
export type InvoiceWithContents = Invoice & {
  invoiceContents: InvoiceContents[];
};
const statusColors: Record<string, string> = {
  SENT: "bg-yellow-100 text-yellow-700 border-yellow-500",
  PAID: "bg-green-100 text-green-700 border-green-500",
  OVERDUE: "bg-red-100 text-red-700 border-red-500",
  CANCELLED: "bg-gray-100 text-gray-700 border-gray-500",
};

const InvoiceTable = () => {
  const [filters, setFilters] = useState<{
    clientName?: string;
    invoiceNumber?: string;
  }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [selectedInvoice, setSelectedInvoice] = useState<
    InvoiceWithContents | undefined
  >(undefined);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data, isLoading, isError } = useQuery<InvoiceResponse>({
    queryKey: ["invoices", filters, currentPage, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

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

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (data?.pagination && currentPage < data.pagination.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleViewInvoice = (invoice: InvoiceWithContents) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };
  async function handleDownloadInvoice(invoiceData: InvoiceWithContents) {
    try {
      setIsDownloading(true);
      // Generate the PDF buffer
      const pdfBuffer = await generateInvoicePDF(invoiceData);

      // Create a Blob from the PDF buffer
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });

      // Create a temporary URL
      const url = window.URL.createObjectURL(blob);

      // Create a hidden anchor element
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `invoice_${invoiceData.invoiceNumber}.pdf`; // Custom filename

      // Append to body and trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setIsDownloading(false);
    } catch (error) {
      setIsDownloading(false);
      console.error("Error generating/downloading PDF:", error);
      // Add your error handling here
    }
  }

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
                <TableHead>Invoice #</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
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
                    onClick={() =>
                      handleViewInvoice(invoice as InvoiceWithContents)
                    }
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>
                      {invoice.createdAt
                        ? format(new Date(invoice.createdAt), "dd/MM/yyyy")
                        : "N/A"}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`px-2 py-1 text-sm font-semibold rounded-md border ${statusColors[invoice.status]}`}
                      >
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // This stops the event from bubbling up to the row
                          handleDownloadInvoice(invoice as InvoiceWithContents);
                        }}
                        disabled={isDownloading}
                        className="text-white hover:text-black bg-shopping hover:bg-shopping/50 dark:hover:bg-indigo-950/30 transition-all"
                      >
                        {isDownloading ? "Generating..." : "Download"}
                      </Button>
                    </TableCell>
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
