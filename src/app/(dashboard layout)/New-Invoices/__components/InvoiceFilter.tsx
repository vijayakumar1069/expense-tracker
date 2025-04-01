"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Filter,
  Search,
  X,
  Receipt,
  CalendarRange,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";

// InvoiceFilter; component for filtering/searching invoices
const InvoiceFilter = ({
  onFilterChange,
}: {
  onFilterChange: (filters: {
    clientName?: string;
    clientCompanyName?: string;
    invoiceNumber?: string;
  }) => void;
}) => {
  const [clientNameFilter, setClientNameFilter] = useState<string>("");
  const [invoiceNumberFilter, setInvoiceNumberFilter] = useState<string>("");
  const [clientCompanyNameFilter, setClientCompanyNameFilter] =
    useState<string>("");
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      clientName: clientNameFilter || undefined,
      invoiceNumber: invoiceNumberFilter || undefined,
      clientCompanyName: clientCompanyNameFilter || undefined,
    });
  };

  const handleClearFilters = () => {
    setInvoiceNumberFilter("");
    setClientCompanyNameFilter("");
    setClientNameFilter("");
    onFilterChange({});
  };

  const filtersActive =
    clientNameFilter || invoiceNumberFilter || clientCompanyNameFilter;

  return (
    <Card className="mb-6 border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950 overflow-hidden">
      <CardHeader className="pb-0 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-lg">
              <SlidersHorizontal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Invoice Filters
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                Find invoices by client or invoice number
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {filtersActive && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs h-8 px-3 border-gray-200 dark:border-gray-700 text-white hover:bg-red-600 dark:text-gray-100 dark:hover:bg-red-700"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-9 w-9 p-0 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              {expanded ? (
                <X size={16} className="text-gray-600 dark:text-gray-400" />
              ) : (
                <Filter
                  size={16}
                  className="text-gray-600 dark:text-gray-400"
                />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="">
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expanded ? "max-h-80" : "max-h-0"
          }`}
        >
          <form
            onSubmit={handleFilterSubmit}
            className="grid gap-5 mt-3 p-2 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label
                  htmlFor="clientNameFilter"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
                >
                  <Receipt className="h-3.5 w-3.5 text-indigo-500" />
                  Client Name
                </Label>
                <div className="relative">
                  <Input
                    id="clientNameFilter"
                    placeholder="Filter by client name"
                    value={clientNameFilter}
                    onChange={(e) => setClientNameFilter(e.target.value)}
                    className="pl-9 h-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
              <div className="space-y-2.5">
                <Label
                  htmlFor="clientCompanyNameFilter"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
                >
                  Client Company Name
                </Label>
                <div className="relative">
                  <Input
                    id="clientCompanyNameFilter"
                    placeholder="Filter by client name"
                    value={clientCompanyNameFilter}
                    onChange={(e) => setClientCompanyNameFilter(e.target.value)}
                    className="pl-9 h-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label
                  htmlFor="invoiceNumberFilter"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
                >
                  <CalendarRange className="h-3.5 w-3.5 text-indigo-500" />
                  Invoice Number
                </Label>
                <div className="relative">
                  <Input
                    id="invoiceNumberFilter"
                    placeholder="Filter by invoice #"
                    value={invoiceNumberFilter}
                    onChange={(e) => setInvoiceNumberFilter(e.target.value)}
                    className="pl-9 h-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="px-5 h-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all duration-150"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </form>
        </div>

        {!expanded && filtersActive && (
          <div className="flex flex-wrap items-center gap-2 mt-3 py-1.5">
            <div className="text-xs px-2.5 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-md font-medium">
              Active Filters:
            </div>

            {clientNameFilter && (
              <div className="text-xs flex items-center px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm">
                <span className="font-medium mr-1.5">Client:</span>{" "}
                {clientNameFilter}
              </div>
            )}

            {invoiceNumberFilter && (
              <div className="text-xs flex items-center px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm">
                <span className="font-medium mr-1.5">Invoice #:</span>{" "}
                {invoiceNumberFilter}
              </div>
            )}

            {clientCompanyNameFilter && (
              <div className="text-xs flex items-center px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm">
                <span className="font-medium mr-1.5">Client Company:</span>{" "}
                {clientCompanyNameFilter}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceFilter;
