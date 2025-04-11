"use client";

import { useCallback, useEffect, useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash.debounce";

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
  const [searchQuery, setSearchQuery] = useState("");

  // Debounced setter to avoid spamming queries
  const debouncedSetSearchQuery = debounce(setSearchQuery, 300);

  const {
    data: clients = [],
    isLoading,
    isError,
    error,
  } = useQuery<Client[]>({
    queryKey: ["clients", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const res = await fetch(
        `/api/search-clients?query=${encodeURIComponent(searchQuery)}`
      );
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
    enabled: !!searchQuery.trim(), // Only run if query is not empty
    staleTime: 1000 * 60 * 5, // 5 mins caching
    // keepPreviousData: true, // Keeps showing old data while fetching new
    refetchOnWindowFocus: false, // Optional: no refetch when tab focuses
    retry: 1, // Retry once on failure
  });
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);
  const handleSelect = useCallback(
    (client: Client) => {
      form.setValue("clientId", client.id);
      form.setValue("clientName", client.name);
      form.setValue("clientEmail", client.email);
      form.setValue("clientPhone1", client.phone1);
      form.setValue("clientPhone2", client.phone2 || "");
      form.setValue("clientStreetName", client.streetName);
      form.setValue("clientCity", client.city);
      form.setValue("clientZip", client.zip);
      form.setValue("clientState", client.state);
      form.setValue("clientCompanyName", client.companyName || "");
      form.setValue("clientCountry", client.country);

      setOpen(false);
    },
    [form, setOpen]
  );
  useEffect(() => {
    if (clients.length === 1 && form.watch("clientId") !== clients[0].id) {
      handleSelect(clients[0]);
    }
  }, [handleSelect, clients, form]);

  return (
    <FormItem className="flex flex-col">
      <FormLabel>Company Name</FormLabel>
      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal"
            >
              {form.watch("clientCompanyName") || "Select a client..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search company..."
              onValueChange={debouncedSetSearchQuery}
              className="text-sm"
            />
            <CommandList>
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {isError && (
                <CommandEmpty>Error: {(error as Error)?.message}</CommandEmpty>
              )}
              {!isLoading && !isError && clients.length === 0 && (
                <CommandEmpty>No companies found.</CommandEmpty>
              )}
              {!isLoading && clients.length > 0 && (
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {clients.map((client) => (
                    <CommandItem
                      key={client.id}
                      value={client.id}
                      onSelect={() => handleSelect(client)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          form.watch("clientId") === client.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col space-y-0.5 justify-start items-start">
                        <span className="text-sm font-medium">
                          {client.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {client.email}
                          {client.companyName && ` • ${client.companyName}`}
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
