"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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

// Mock client data - replace with actual API call
const mockClients = [
  {
    id: "1",
    name: "Acme Corporation",
    email: "info@acme.com",
    phone: "123-456-7890",
    address: "123 Business Ave, Suite 456, New York, NY 10001",
  },
  {
    id: "2",
    name: "TechStart Inc",
    email: "contact@techstart.io",
    phone: "555-123-4567",
    address: "789 Innovation Way, San Francisco, CA 94107",
  },
  {
    id: "3",
    name: "Global Solutions Ltd",
    email: "hello@globalsolutions.com",
    phone: "888-555-1212",
    address: "456 Enterprise Blvd, Chicago, IL 60601",
  },
];

export function ClientSearch({ form }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  // We'll use a single source of truth instead of separate filter state
  const handleSelect = (clientId: string) => {
    const selectedClient = mockClients.find((client) => client.id === clientId);
    if (selectedClient) {
      // Update form fields with selected client data
      form.setValue("clientId", selectedClient.id);
      form.setValue("clientName", selectedClient.name);
      form.setValue("clientEmail", selectedClient.email);
      form.setValue("clientPhone", selectedClient.phone);
      form.setValue("clientAddress", selectedClient.address);
      setValue(selectedClient.id);
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
          {/* Let Command handle filtering internally */}
          <Command
            filter={(value, search) => {
              // Custom filter function that checks both name and ID
              if (!search) return 1;

              // Check if any client property matches
              const client = mockClients.find((c) => c.id === value);
              if (!client) return 0;

              // Search client name (case insensitive)
              const nameMatch = client.name
                .toLowerCase()
                .includes(search.toLowerCase());

              // Search client email (case insensitive)
              const emailMatch = client.email
                .toLowerCase()
                .includes(search.toLowerCase());

              return nameMatch || emailMatch ? 1 : 0;
            }}
          >
            <CommandInput placeholder="Search clients..." />
            <CommandList>
              <CommandEmpty>No clients found.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {mockClients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.id} // Use ID as the value for filtering
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
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}
