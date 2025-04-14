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
import ClientDialog from "./ClientDialog";
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
import ClientFilters from "./ClientFilters";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
// import { deleteClient } from "../__actions/clientsActions";
// import { toast } from "sonner";
import { Client, ClientResponse } from "@/utils/types";

// Define proper types for client data and API responses

const ClientTable = () => {
  const [filters, setFilters] = useState<{
    name?: string;
    email?: string;
    companyName?: string;
  }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(
    undefined
  );

  // const queryClient = useQueryClient();

  // Query for fetching clients with TanStack Query
  const { data, isLoading, isError } = useQuery<ClientResponse>({
    queryKey: ["clients", filters, currentPage, limit],
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      // Add filter parameters if they exist
      if (filters.name) params.append("name", filters.name);
      if (filters.email) params.append("email", filters.email);
      if (filters.companyName)
        params.append("companyName", filters.companyName);

      const response = await fetch(`/api/get-all-clients?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch clients");
      }

      return response.json();
    },
    enabled: !!filters, // Only run if query is not empty
    staleTime: 1000 * 60 * 5, // 5 mins caching
    // keepPreviousData: true, // Keeps showing old data while fetching new
    refetchOnWindowFocus: false, // Optional: no refetch when tab focuses
    retry: 1, // Retry once on failure
  });

  const handleAddNew = () => {
    setSelectedClient(undefined);
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

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
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
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    // Reset selected client when dialog closes
    if (!open) {
      setSelectedClient(undefined);
    }
  };
  const clients = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        {/* Left Side - Title */}
        <h1 className="text-2xl lg:text-3xl font-bold text-primary lg:order-1">
          Client Management
        </h1>

        {/* Right Side - Controls */}
        <div className="flex flex-col xs:flex-row md:flex-row gap-3 items-stretch justify-end lg:order-2">
          {/* Filters - Takes available space on mobile */}

          {/* Add Button - Full width on mobile, auto on desktop */}
          <Button
            onClick={handleAddNew}
            className="flex items-center gap-1 w-fit xs:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
          <div className=" xs:flex-none">
            <ClientFilters onFilterChange={setFilters} />
          </div>
        </div>
      </div>

      <ClientDialog
        key={selectedClient?.id || "new-client"} // Force remount on client change
        client={selectedClient}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Company</TableHead>
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
              ) : clients.length > 0 ? (
                clients.map((client) => (
                  <TableRow
                    key={client.id}
                    onClick={() => handleViewClient(client)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <TableCell className="font-medium">
                      {client.name || client.companyName}
                    </TableCell>
                    <TableCell>{client.companyName}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone1}</TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={client.city}
                    >
                      {client.city}
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
                    {filters.name || filters.email
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
export default ClientTable;
