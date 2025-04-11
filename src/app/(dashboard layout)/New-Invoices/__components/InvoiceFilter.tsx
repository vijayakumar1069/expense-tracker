"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoiceStatus } from "@prisma/client";
import { debounce } from "lodash";

const InvoiceFilter = ({
  onFilterChange,
}: {
  onFilterChange: (filters: {
    clientName?: string;
    clientCompanyName?: string;
    invoiceNumber?: string;
    status?: InvoiceStatus;
  }) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "">("");

  const handleApplyFilters = useMemo(
    () =>
      debounce(() => {
        onFilterChange({
          clientName: clientName || undefined,
          clientCompanyName: companyName || undefined,
          invoiceNumber: invoiceNumber || undefined,
          status: status || undefined,
        });
        setIsOpen(false);
      }, 300),
    [clientName, companyName, invoiceNumber, status, onFilterChange]
  );

  const handleClearFilters = () => {
    setClientName("");
    setCompanyName("");
    setInvoiceNumber("");
    setStatus("");
    onFilterChange({});
    setIsOpen(false);
  };

  const filtersActive = clientName || companyName || invoiceNumber || status;

  return (
    <div className="flex items-center gap-4 w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2 group">
            <SlidersHorizontal className="h-4 w-4 text-white group-hover:text-primary" />
            <span className="text-white group-hover:text-primary">Search</span>
            {filtersActive && (
              <span className="ml-1 rounded-full group-hover:bg-primary bg-white group-hover:text-primary text-white  w-2 h-2" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0" align="end">
          <div className="p-4 grid gap-4">
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input
                placeholder="Search by client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                placeholder="Search by company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Invoice Number</Label>
              <Input
                placeholder="Search by invoice #"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value: InvoiceStatus) => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="Raised">Raised</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
              <Button onClick={handleApplyFilters} className="ml-auto">
                Apply
              </Button>
            </div>
          </div>

          {filtersActive && (
            <div className="p-4 border-t">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Active filters:</span>
                {clientName && (
                  <span className="px-2 py-1 rounded bg-accent">
                    Client: {clientName}
                  </span>
                )}
                {companyName && (
                  <span className="px-2 py-1 rounded bg-accent">
                    Company: {companyName}
                  </span>
                )}
                {invoiceNumber && (
                  <span className="px-2 py-1 rounded bg-accent">
                    Invoice #: {invoiceNumber}
                  </span>
                )}
                {status && (
                  <span className="px-2 py-1 rounded bg-accent">
                    Status: {status.toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default InvoiceFilter;
