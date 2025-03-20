// TransactionFilter.tsx
"use client";

import {
  useState,
  useEffect,
  ForwardRefExoticComponent,
  RefAttributes,
} from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { CalendarIcon, Filter, LucideProps, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { PaymentType } from "@/utils/types";
import { CATEGORIES, PAYMENT_METHODS } from "@/utils/constants/consts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FilterProps {
  onFilterChange: (filters: {
    type?: string;
    category?: string;
    paymentMethodType?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: string;
    maxAmount?: string;
    search?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }) => void;
  initialFilters?: {
    type?: string;
    category?: string;
    paymentMethodType?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: string;
    maxAmount?: string;
    search?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  };
}
const TransactionFilter = ({
  onFilterChange,
  initialFilters = {},
}: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: initialFilters.type || "",
    category: initialFilters.category || "",
    paymentMethodType: initialFilters.paymentMethodType || "",
    startDate: initialFilters.startDate
      ? new Date(initialFilters.startDate)
      : undefined,
    endDate: initialFilters.endDate
      ? new Date(initialFilters.endDate)
      : undefined,
    minAmount: initialFilters.minAmount || "",
    maxAmount: initialFilters.maxAmount || "",
    search: initialFilters.search || "",
    sortBy: initialFilters.sortBy || "createdAt",
    sortDirection: initialFilters.sortDirection || ("desc" as "asc" | "desc"),
  });

  const handleFilterChange = (
    field: string,
    value: string | Date | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    const formattedFilters = {
      ...filters,
      startDate: filters.startDate
        ? format(filters.startDate, "yyyy-MM-dd")
        : undefined,
      endDate: filters.endDate
        ? format(filters.endDate, "yyyy-MM-dd")
        : undefined,
    };

    onFilterChange(formattedFilters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const resetValues = {
      type: "",
      category: "",
      paymentMethodType: "",
      startDate: undefined,
      endDate: undefined,
      minAmount: "",
      maxAmount: "",
      search: "",
      sortBy: "createdAt",
      sortDirection: "desc" as "asc" | "desc",
    };

    setFilters(resetValues);
    onFilterChange(resetValues);
    setIsOpen(false);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (filters.search !== initialFilters.search) {
        const formattedFilters = {
          ...filters,
          startDate: filters.startDate
            ? format(filters.startDate, "yyyy-MM-dd")
            : undefined,
          endDate: filters.endDate
            ? format(filters.endDate, "yyyy-MM-dd")
            : undefined,
        };

        onFilterChange({ ...formattedFilters });
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters, onFilterChange, initialFilters.search]);

  return (
    <div className="py-4 px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Input
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {Object.values(filters).some(
                (value) =>
                  value &&
                  value !== "" &&
                  value !== "createdAt" &&
                  value !== "desc"
              ) && <span className="ml-1 rounded-full bg-primary w-2 h-2" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[340px] p-0"
            align="end"
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
          >
            <Card className="border-0">
              <CardContent className="p-4 grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => handleFilterChange("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-type">All Types</SelectItem>
                      <SelectItem value="INCOME">Income</SelectItem>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      handleFilterChange("category", value)
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-categories">
                        All Categories
                      </SelectItem>
                      {CATEGORIES?.map(
                        (category: {
                          id: number;
                          name: string;
                          icon: ForwardRefExoticComponent<
                            Omit<LucideProps, "ref"> &
                              RefAttributes<SVGSVGElement>
                          >;
                          color: string;
                        }) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethodType">Payment Method</Label>
                  <Select
                    value={filters.paymentMethodType}
                    onValueChange={(value) =>
                      handleFilterChange("paymentMethodType", value)
                    }
                  >
                    <SelectTrigger id="paymentMethodType">
                      <SelectValue placeholder="All Payment Methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-payment-methods">
                        All Payment Methods
                      </SelectItem>
                      {PAYMENT_METHODS?.map((method: PaymentType) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Min Amount</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={filters.minAmount}
                      onChange={(e) =>
                        handleFilterChange("minAmount", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Max Amount</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={filters.maxAmount}
                      onChange={(e) =>
                        handleFilterChange("maxAmount", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.startDate ? (
                            format(filters.startDate, "PPP")
                          ) : (
                            <span>Start Date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.startDate}
                          onSelect={(date) =>
                            handleFilterChange("startDate", date || undefined)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.endDate ? (
                            format(filters.endDate, "PPP")
                          ) : (
                            <span>End Date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.endDate}
                          onSelect={(date) =>
                            handleFilterChange("endDate", date || undefined)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortBy">Sort By</Label>
                  <div className="flex gap-2">
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) =>
                        handleFilterChange("sortBy", value)
                      }
                    >
                      <SelectTrigger id="sortBy">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Created Date</SelectItem>
                        <SelectItem value="date">Transaction Date</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.sortDirection}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "sortDirection",
                          value as "asc" | "desc"
                        )
                      }
                    >
                      <SelectTrigger id="sortDirection" className="w-[100px]">
                        <SelectValue placeholder="Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="flex items-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyFilters}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
export default TransactionFilter;
