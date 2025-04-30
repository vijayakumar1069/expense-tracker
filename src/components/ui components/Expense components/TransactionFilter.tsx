// TransactionFilter.tsx
"use client";

import {
  useState,
  useEffect,
  ForwardRefExoticComponent,
  RefAttributes,
  // useRef,
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
import { CalendarIcon, Crosshair, Filter, LucideProps, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { PaymentType } from "@/utils/types";
import { CATEGORIES, PAYMENT_METHODS } from "@/utils/constants/consts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFinancialYear } from "@/app/context/FinancialYearContext";

interface FilterProps {
  onApplyFilters: (filters: {
    type?: string;
    category?: string;
    paymentMethodType?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: string;
    maxAmount?: string;
    search?: string;
    sortBy?: string;
    transactionNumber?: string;
    sortDirection?: "asc" | "desc";
    byMonth?: string;
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
    transactionNumber?: string;

    sortBy?: string;
    sortDirection?: "asc" | "desc";
    byMonth?: string;
  };
}
const getFinancialYearDateRange = (financialYear: string) => {
  // Parse years from format "2025-2026"
  const [startYearStr, endYearStr] = financialYear.split("-");
  const startYear = parseInt(startYearStr);
  const endYear = parseInt(endYearStr);

  // Assuming financial year starts on April 1st and ends on March 31st
  const startDate = new Date(startYear, 3, 1); // April 1st (month is 0-indexed)
  const endDate = new Date(endYear, 2, 31); // March 31st

  return { startDate, endDate };
};
const getDateRangeForMonth = (byMonth: string) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  let startDate: Date;
  let endDate: Date;

  switch (byMonth) {
    case "ThisMonth":
      startDate = new Date(currentYear, currentMonth, 1);
      endDate = new Date(currentYear, currentMonth + 1, 0);
      break;
    case "LastMonth":
      startDate = new Date(currentYear, currentMonth - 1, 1);
      endDate = new Date(currentYear, currentMonth, 0);
      break;
    case "Last2Months":
      startDate = new Date(currentYear, currentMonth - 2, 1);
      endDate = new Date(currentYear, currentMonth, 0);
      break;
    case "Last3Months":
      startDate = new Date(currentYear, currentMonth - 3, 1);
      endDate = new Date(currentYear, currentMonth, 0);
      break;
    case "Last6Months":
      startDate = new Date(currentYear, currentMonth - 6, 1);
      endDate = new Date(currentYear, currentMonth, 0);
      break;

    default:
      return { startDate: undefined, endDate: undefined };
  }

  return { startDate, endDate };
};

const TransactionFilter = ({
  // onFilterChange,
  initialFilters = {},

  onApplyFilters,
}: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // const isInitialMount = useRef(true); // Add this ref to track initial mount
  // const initialSearch = useRef(initialFilters.search || "");
  // const effectRef = useRef(true);
  const [searchValue, setSearchValue] = useState(initialFilters.search || "");
  const { financialYear } = useFinancialYear();
  const { startDate: fyStartDate, endDate: fyEndDate } =
    getFinancialYearDateRange(financialYear);
  const [filters, setFilters] = useState({
    type: initialFilters.type || "",
    category: initialFilters.category || "",
    paymentMethodType: initialFilters.paymentMethodType || "",
    transactionNumber: initialFilters.transactionNumber || "",
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
    byMonth: initialFilters.byMonth || "",
  });
  useEffect(() => {
    // Check if initial dates are outside financial year range and adjust if needed
    if (initialFilters.startDate) {
      const initialStartDate = new Date(initialFilters.startDate);
      if (initialStartDate < fyStartDate || initialStartDate > fyEndDate) {
        setFilters((prev) => ({ ...prev, startDate: undefined }));
      }
    }

    if (initialFilters.endDate) {
      const initialEndDate = new Date(initialFilters.endDate);
      if (initialEndDate < fyStartDate || initialEndDate > fyEndDate) {
        setFilters((prev) => ({ ...prev, endDate: undefined }));
      }
    }
  }, [initialFilters]);

  const handleFilterChange = (
    field: string,
    value: string | Date | undefined
  ) => {
    setFilters((prev) => {
      // Clear date range when selecting byMonth
      if (field === "byMonth") {
        return {
          ...prev,
          byMonth: value as string,
          startDate: undefined,
          endDate: undefined,
        };
      }

      // Clear byMonth when selecting manual dates
      if (field === "startDate" || field === "endDate") {
        return {
          ...prev,
          byMonth: "",
          [field]: value,
        };
      }

      return { ...prev, [field]: value };
    });
  };

  const applyFilters = () => {
    // If byMonth is selected, convert it to actual date range
    const filtersToApply = { ...filters };

    if (filters.byMonth) {
      const { startDate, endDate } = getDateRangeForMonth(filters.byMonth);
      filtersToApply.startDate = startDate;
      filtersToApply.endDate = endDate;
    }

    const formattedFilters = {
      ...filtersToApply,
      startDate: filtersToApply.startDate
        ? format(filtersToApply.startDate, "yyyy-MM-dd")
        : undefined,
      endDate: filtersToApply.endDate
        ? format(filtersToApply.endDate, "yyyy-MM-dd")
        : undefined,
      // Don't send byMonth to the backend
      byMonth: undefined,
    };

    onApplyFilters(formattedFilters);
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
      byMonth: "",
      transactionNumber: "",
    };

    setFilters(resetValues);
    setSearchValue("");

    const formattedResetValues = {
      ...resetValues,
      startDate: undefined,
      endDate: undefined,
    };

    onApplyFilters(formattedResetValues);
    // setIsOpen(false);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchValue !== filters.search) {
        setFilters((prev) => ({ ...prev, search: searchValue }));

        // Apply search filter with date conversion if byMonth is set
        const filtersToApply = { ...filters, search: searchValue };

        if (filters.byMonth) {
          const { startDate, endDate } = getDateRangeForMonth(filters.byMonth);
          filtersToApply.startDate = startDate;
          filtersToApply.endDate = endDate;
        }

        const formattedFilters = {
          ...filtersToApply,
          startDate: filtersToApply.startDate
            ? format(filtersToApply.startDate, "yyyy-MM-dd")
            : undefined,
          endDate: filtersToApply.endDate
            ? format(filtersToApply.endDate, "yyyy-MM-dd")
            : undefined,
          byMonth: undefined,
        };

        onApplyFilters(formattedFilters);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters, onApplyFilters, searchValue]);

  return (
    <div className="">
      <div className="flex items-center justify-center space-x-4">
        {/* <div className="relative w-full md:w-72">
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
        </div> */}

        <Popover modal={true} open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 group">
              <Filter className="h-4 w-4 text-white group-hover:text-primary " />
              <span className="text-white group-hover:text-primary">
                Search
              </span>
              {Object.values(filters).some(
                (value) =>
                  value &&
                  value !== "" &&
                  value !== "createdAt" &&
                  value !== "desc"
              ) && (
                <span className="ml-1 rounded-full bg-white group-hover:bg-primary w-2 h-2 text-white" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[340px] p-0 mb-5 overflow-y-auto max-h-[500px]"
            align="end"
            // onInteractOutside={(e) => {
            //   e.preventDefault();
            // }}
          >
            <Card className="border-0">
              <CardContent className="p-4 grid gap-4 ">
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => handleFilterChange("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Expense Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCOME">Income</SelectItem>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionNumber">Transaction Number</Label>
                  <Input
                    id="transactionNumber"
                    placeholder="EXP-001 or INC-001"
                    value={filters.transactionNumber}
                    onChange={(e) =>
                      handleFilterChange("transactionNumber", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="byMonth">Transaction By Month</Label>
                  <Select
                    value={filters.byMonth}
                    onValueChange={(value) =>
                      handleFilterChange("byMonth", value)
                    }
                  >
                    <SelectTrigger id="byMonth">
                      <SelectValue placeholder="Transaction By Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ThisMonth">This Month</SelectItem>
                      <SelectItem value="LastMonth">Last Month</SelectItem>
                      <SelectItem value="Last2Months">Last 2 Months</SelectItem>
                      <SelectItem value="Last3Months">Last 3 Months</SelectItem>
                      <SelectItem value="Last6Months">Last 6 Months</SelectItem>
                    </SelectContent>
                  </Select>
                  {filters.byMonth && (
                    <p className="text-xs text-muted-foreground">
                      Date range selection is disabled when filtering by month
                    </p>
                  )}
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
                      <SelectValue placeholder="Categories" />
                    </SelectTrigger>
                    <SelectContent>
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
                      <SelectValue placeholder="Payment Methods" />
                    </SelectTrigger>
                    <SelectContent>
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
                          disabled={!!filters.byMonth}
                        >
                          <CalendarIcon className=" h-4 w-4" />
                          {filters.startDate ? (
                            format(filters.startDate, "PPP")
                          ) : (
                            <span>Start Date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Calendar
                          mode="single"
                          selected={filters.startDate}
                          onSelect={(date) =>
                            handleFilterChange("startDate", date || undefined)
                          }
                          disabled={(date) =>
                            date < fyStartDate || date > fyEndDate
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
                          disabled={!!filters.byMonth}
                        >
                          <CalendarIcon className=" h-4 w-4" />
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
                          disabled={(date) =>
                            date < fyStartDate || date > fyEndDate
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

                <div className="flex items-center justify-between pt-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="flex items-center gap-2 text-white hover:text-white bg-red-500 hover:bg-red-600 border-red-200"
                  >
                    <X className="h-4 w-4" />
                    Reset
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 bg-black text-white hover:text-white hover:bg-black border-gray-200"
                  >
                    <Crosshair className="h-4 w-4" />
                    Close
                  </Button>

                  <Button
                    size="sm"
                    onClick={applyFilters}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4 text-white" />
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
