"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Client interface
interface Client {
  id: string;
  name: string;
  email: string;
  phone1: string;
  phone2: string;
  streetName: string;
  companyName: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ClientSearch({ form }: { form: any }) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch clients when search query changes
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use a timeout to debounce the requests
        const timeout = setTimeout(async () => {
          const response = await fetch(
            `/api/search-clients?query=${encodeURIComponent(searchQuery)}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch clients");
          }

          const data = await response.json();
          setClients(data);
          setLoading(false);
        }, 300); // 300ms debounce

        return () => clearTimeout(timeout);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    fetchClients();
  }, [searchQuery]);

  const handleSelect = (clientId: string) => {
    const selectedClient = clients.find((client) => client.id === clientId);

    if (selectedClient) {
      // Update form fields with selected client data
      form.setValue("clientId", selectedClient.id);
      form.setValue("clientName", selectedClient.name);
      form.setValue("clientEmail", selectedClient.email);
      form.setValue("clientPhone1", selectedClient.phone1);
      form.setValue("clientPhone2", selectedClient.phone2);
      form.setValue("clientStreetName", selectedClient.streetName);
      form.setValue("clientCity", selectedClient.city);
      form.setValue("clientZip", selectedClient.zip);
      form.setValue("clientState", selectedClient.state);
      form.setValue("clientCompanyName", selectedClient?.companyName);

      form.setValue("clientCountry", selectedClient.country);
    }
    setOpen(false);
  };

  return (
    <FormItem className="flex flex-col">
      <FormLabel>Client</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal"
            >
              {form.watch("clientName") || "Select a client..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput
              placeholder="Search clients..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <CommandEmpty>Error: {error}</CommandEmpty>
              ) : clients.length === 0 ? (
                <CommandEmpty>No clients found.</CommandEmpty>
              ) : (
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {clients.map((client) => (
                    <CommandItem
                      key={client.id}
                      value={client.id}
                      onSelect={() => handleSelect(client.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          form.watch("clientId") === client.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{client.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {client.email}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}
