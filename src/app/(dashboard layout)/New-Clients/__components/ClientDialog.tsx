"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Client, ClientFormValues, ClientResponse } from "@/utils/types";
import ClientForm from "./ClientForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addClient,
  updateClient,
  deleteClient,
} from "../__actions/clientsActions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, X } from "lucide-react";
import { PasswordVerification } from "@/components/ui components/PasswordVerification";

const ClientDialog = ({
  client,
  open,
  onOpenChange,
}: {
  client?: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [showPasswordVerification, setShowPasswordVerification] =
    useState(false);
  // Set edit mode based on if we're adding a new client or viewing existing
  const isNewClient = !client?.id;

  // Transform client data to match form values format
  const formDefaultValues = client
    ? {
        name: client.name,
        email: client.email,
        phone1: client.phone1,
        phone2: client.phone2 || "",
        companyName: client.companyName || "",
        streetName: client.streetName || "",
        city: client.city || "",
        state: client.state || "",
        zip: client.zip || "",
        country: client.country || "",
      }
    : undefined;

  // Reset edit mode when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Small delay to avoid visual glitch during closing animation
      setTimeout(() => setIsEditMode(isNewClient), 10);
    } else {
      setIsEditMode(isNewClient);
    }
    onOpenChange(open);
  };

  // Add client mutation
  const addMutation = useMutation({
    mutationFn: (data: ClientFormValues) => addClient(data),
    onMutate: async (newClientData) => {
      toast.loading("Adding client...", {
        id: "add-client-toast",
        duration: 2000,
      });

      await queryClient.cancelQueries({
        queryKey: ["clients"],
        exact: false,
      });

      const queryCache = queryClient.getQueryCache();
      const clientQueries = queryCache.findAll({
        queryKey: ["clients"],
      });

      const previousDataMap = new Map();
      clientQueries.forEach((query) => {
        previousDataMap.set(query.queryKey, query.state.data);
      });

      // Create optimistic client
      const optimisticClient = {
        id: `temp-${Date.now()}`,
        name: newClientData.name,
        email: newClientData.email,
        phone1: newClientData.phone1,
        phone2: newClientData.phone2,
        companyName: newClientData.companyName,
        streetName: newClientData.streetName,
        city: newClientData.city,
        zipCode: newClientData.zip,
        country: newClientData.country,
        userId: "optimistic-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      clientQueries.forEach((query) => {
        const data = query.state.data as ClientResponse;
        if (data && data.data) {
          queryClient.setQueryData(query.queryKey, {
            ...data,
            data: [...data.data, optimisticClient],
          });
        }
      });

      return { previousDataMap, optimisticClient };
    },
    onSuccess: () => {
      toast.success("Client added successfully!", {
        id: "add-client-toast",
        duration: 2500,
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsEditMode(false);
      handleOpenChange(false);
    },
    onError: (error, _, context) => {
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to add client",
        {
          id: "add-client-toast",
          duration: 2500,
        }
      );
    },
  });

  // Update client mutation
  const updateMutation = useMutation({
    mutationFn: (data: ClientFormValues & { id: string }) => updateClient(data),
    onMutate: async (updatedClientData) => {
      toast.loading("Updating client...", {
        id: "update-client-toast",
        duration: 2000,
      });

      await queryClient.cancelQueries({
        queryKey: ["clients"],
        exact: false,
      });

      const queryCache = queryClient.getQueryCache();
      const clientQueries = queryCache.findAll({
        queryKey: ["clients"],
      });

      const previousDataMap = new Map();
      clientQueries.forEach((query) => {
        previousDataMap.set(query.queryKey, query.state.data);
      });

      clientQueries.forEach((query) => {
        const data = query.state.data as ClientResponse;
        if (data && data.data) {
          queryClient.setQueryData(query.queryKey, {
            ...data,
            data: data.data.map((c) =>
              c.id === updatedClientData.id ? { ...c, ...updatedClientData } : c
            ),
          });
        }
      });

      return { previousDataMap };
    },
    onSuccess: () => {
      toast.success("Client updated successfully!", {
        id: "update-client-toast",
        duration: 2500,
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsEditMode(false);
      handleOpenChange(false);
    },
    onError: (error, _, context) => {
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to update client",
        {
          id: "update-client-toast",
          duration: 2500,
        }
      );
    },
  });

  // Delete client mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onMutate: async (clientId) => {
      toast.loading("Deleting client...", {
        id: "delete-client-toast",
        duration: 2000,
      });

      await queryClient.cancelQueries({
        queryKey: ["clients"],
        exact: false,
      });

      const queryCache = queryClient.getQueryCache();
      const clientQueries = queryCache.findAll({
        queryKey: ["clients"],
      });

      const previousDataMap = new Map();
      clientQueries.forEach((query) => {
        previousDataMap.set(query.queryKey, query.state.data);
      });

      clientQueries.forEach((query) => {
        const data = query.state.data as ClientResponse;
        if (data && data.data) {
          queryClient.setQueryData(query.queryKey, {
            ...data,
            data: data.data.filter((c) => c.id !== clientId),
          });
        }
      });

      return { previousDataMap };
    },
    onSuccess: () => {
      toast.success("Client deleted successfully!", {
        id: "delete-client-toast",
        duration: 2500,
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      handleOpenChange(false);
    },
    onError: (error, _, context) => {
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to delete client",
        {
          id: "delete-client-toast",
          duration: 2500,
        }
      );
    },
  });

  const handleSubmit = (data: ClientFormValues) => {
    if (client?.id) {
      updateMutation.mutate({ ...data, id: client.id });
    } else {
      addMutation.mutate(data);
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    // Stop propagation to prevent row click
    if (e) {
      e.stopPropagation();
    }

    setClientToDelete(id);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = () => {
    if (clientToDelete) {
      deleteMutation.mutate(clientToDelete);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };
  // Render client detail view (read-only mode)
  const renderClientDetails = () => {
    if (!client) return null;

    return (
      <div className="space-y-6 p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
          <p className="text-base">{client.name}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
          <p className="text-base">{client.email}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
          <p className="text-base">{client.phone1}</p>
        </div>

        <div className="space-y-2">
          {client.companyName && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                CompanyName
              </h3>
              <p className="text-base whitespace-pre-wrap">
                {client.companyName}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">City</h3>
          <p className="text-base whitespace-pre-wrap">{client.city}</p>
        </div>
      </div>
    );
  };
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`${showPasswordVerification ? "sm:max-w-[435px]" : "sm:max-w-4xl"}  bg-primary-foreground max-h-[90vh] overflow-y-auto p-2`}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-2xl">
            {isNewClient
              ? "Add New Client"
              : isEditMode
                ? "Edit Client"
                : "Client Details"}
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
            {isEditMode || isNewClient ? (
              <ClientForm
                defaultValues={formDefaultValues}
                onSubmit={handleSubmit}
                isSubmitting={addMutation.isPending || updateMutation.isPending}
                isEditMode={isEditMode}
              />
            ) : (
              renderClientDetails()
            )}

            {/* Footer only shows in view mode */}
            {!isNewClient && !isEditMode && (
              <DialogFooter className="flex justify-between sm:justify-between px-4 pb-4">
                <div>
                  <Button
                    variant="destructive"
                    onClick={(e) => {
                      handleDelete(client.id, e);
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
                    variant="outline"
                    onClick={() => setShowPasswordVerification(true)}
                  >
                    <Pencil className="h-4 w-4 mr-2 " />
                    <span className="">Edit</span>
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

            {/* Cancel button for edit mode */}
            {!isNewClient && isEditMode && (
              <div className="flex justify-end ">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false);
                    handleOpenChange(false);
                  }}
                  className="mr-2"
                >
                  Cancel
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>

      {/* Delete confirmation dialog */}
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
                  Are you sure you want to delete this client? This action
                  cannot be undone.
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
                  Delete Client
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
export default ClientDialog;
